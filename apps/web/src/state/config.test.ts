import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  LOCAL_AI_DEFAULT_BASE_URL,
  OSM_API_BASE_URL,
  loadConfig,
  resolveApiProviderKind,
  saveConfig,
  withApiProvider,
} from './config';

describe('api provider config', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => storage.clear(),
      },
    });
    localStorage.clear();
  });

  it('defaults API mode to osmAPI', () => {
    expect(DEFAULT_CONFIG.apiProvider).toBe('osm');
    expect(DEFAULT_CONFIG.baseUrl).toBe(OSM_API_BASE_URL);
  });

  it('locks osmAPI to the hosted endpoint while preserving key and model', () => {
    const cfg = withApiProvider(
      {
        ...DEFAULT_CONFIG,
        apiKey: 'osm-key',
        model: 'gpt-oss-120b',
        baseUrl: 'https://api.third-party.example',
      },
      'osm',
    );

    expect(cfg.apiProvider).toBe('osm');
    expect(cfg.baseUrl).toBe(OSM_API_BASE_URL);
    expect(cfg.apiKey).toBe('osm-key');
    expect(cfg.model).toBe('gpt-oss-120b');
  });

  it('switches local AI server mode to a loopback OpenAI-compatible endpoint', () => {
    const cfg = withApiProvider(DEFAULT_CONFIG, 'local');

    expect(cfg.apiProvider).toBe('local');
    expect(cfg.baseUrl).toBe(LOCAL_AI_DEFAULT_BASE_URL);
  });

  it('classifies osmAPI and local OpenAI-compatible endpoints only', () => {
    expect(resolveApiProviderKind(OSM_API_BASE_URL)).toBe('osm');
    expect(resolveApiProviderKind('https://api.osmapi.com/v1')).toBe('osm');
    expect(resolveApiProviderKind('http://localhost:11434/v1')).toBe('local');
    expect(resolveApiProviderKind('http://127.0.0.1:1234/v1')).toBe('local');
    expect(resolveApiProviderKind('https://api.third-party.example')).toBe('osm');
  });

  it('normalizes persisted config to API mode with no third-party providers', () => {
    saveConfig({
      ...DEFAULT_CONFIG,
      mode: 'daemon',
      apiProvider: 'osm',
      baseUrl: 'https://api.openai.com/v1',
      mediaProviders: {
        fal: {
          apiKey: 'media-key',
          baseUrl: 'https://queue.fal.run',
        },
      },
    });

    const saved = loadConfig();

    expect(saved.mode).toBe('api');
    expect(saved.apiProvider).toBe('osm');
    expect(saved.baseUrl).toBe(OSM_API_BASE_URL);
    expect(saved.mediaProviders).toEqual({});
  });
});
