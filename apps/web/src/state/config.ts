import type { ApiProviderKind, AppConfig, MediaProviderCredentials } from '../types';

const STORAGE_KEY = 'osmdesign:config';
const LEGACY_STORAGE_KEY = 'osmdesign:config';

export const OSM_API_BASE_URL = 'https://api.osmapi.com/v1';
export const LOCAL_AI_DEFAULT_BASE_URL = 'http://127.0.0.1:11434/v1';

export const LOCAL_AI_SERVER_PRESETS: Array<{ label: string; baseUrl: string }> = [
  { label: 'Ollama', baseUrl: LOCAL_AI_DEFAULT_BASE_URL },
  { label: 'LM Studio', baseUrl: 'http://127.0.0.1:1234/v1' },
];

export const DEFAULT_CONFIG: AppConfig = {
  mode: 'api',
  apiProvider: 'osm',
  apiKey: '',
  baseUrl: OSM_API_BASE_URL,
  model: '',
  agentId: null,
  skillId: null,
  designSystemId: null,
  onboardingCompleted: false,
  mediaProviders: {},
  agentModels: {},
};

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, '');
}

export function isOsmApiBaseUrl(baseUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(baseUrl);
    const host = normalizeHostname(hostname);
    return protocol === 'https:' && (host === 'osmapi.com' || host.endsWith('.osmapi.com'));
  } catch {
    return false;
  }
}

export function isLocalAiBaseUrl(baseUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(baseUrl);
    const host = normalizeHostname(hostname);
    if (!['http:', 'https:'].includes(protocol)) return false;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === 'host.docker.internal' ||
      host.endsWith('.local') ||
      host.startsWith('10.') ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    );
  } catch {
    return false;
  }
}

export function resolveApiProviderKind(baseUrl: string): ApiProviderKind {
  return isLocalAiBaseUrl(baseUrl) ? 'local' : 'osm';
}

export function withApiProvider(config: AppConfig, apiProvider: ApiProviderKind): AppConfig {
  const localBaseUrl = isLocalAiBaseUrl(config.baseUrl)
    ? config.baseUrl
    : LOCAL_AI_DEFAULT_BASE_URL;
  return {
    ...config,
    mode: 'api',
    apiProvider,
    baseUrl: apiProvider === 'osm' ? OSM_API_BASE_URL : localBaseUrl,
  };
}

function normalizeConfig(parsed: Partial<AppConfig>): AppConfig {
  const apiProvider =
    parsed.apiProvider === 'local' || parsed.apiProvider === 'osm'
      ? parsed.apiProvider
      : resolveApiProviderKind(parsed.baseUrl ?? DEFAULT_CONFIG.baseUrl);
  const baseUrl =
    apiProvider === 'osm'
      ? OSM_API_BASE_URL
      : isLocalAiBaseUrl(parsed.baseUrl ?? '')
        ? parsed.baseUrl!
        : LOCAL_AI_DEFAULT_BASE_URL;
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    mode: 'api',
    apiProvider,
    baseUrl,
    mediaProviders: {},
    agentModels: { ...(parsed.agentModels ?? {}) },
  };
}

export function loadConfig(): AppConfig {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return normalizeConfig(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeConfig(config)));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function hasAnyConfiguredProvider(
  providers: Record<string, MediaProviderCredentials> | undefined,
): boolean {
  if (!providers) return false;
  return Object.values(providers).some((entry) =>
    Boolean(entry?.apiKey?.trim() || entry?.baseUrl?.trim()),
  );
}

export async function syncMediaProvidersToDaemon(
  providers: Record<string, MediaProviderCredentials> | undefined,
  options?: { force?: boolean },
): Promise<void> {
  if (!providers) return;
  try {
    await fetch('/api/media/config', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ providers, force: Boolean(options?.force) }),
    });
  } catch {
    // Daemon offline; localStorage keeps the user's copy for the next save.
  }
}
