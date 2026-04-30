/**
 * OpenAI-compatible API provider. osmDesign only allows the hosted osmAPI
 * endpoint or a local/private OpenAI-compatible server such as Ollama or
 * LM Studio.
 *
 * Routes through the daemon proxy to avoid browser CORS issues.
 * BYOK — the key stays on the user's machine.
 */
import type { AppConfig, ChatMessage } from '../types';
import type { StreamHandlers } from './ai-stream';
import { parseSseFrame } from './sse';

export async function streamMessageOpenAI(
  cfg: AppConfig,
  system: string,
  history: ChatMessage[],
  signal: AbortSignal,
  handlers: StreamHandlers,
): Promise<void> {
  if (cfg.apiProvider !== 'local' && !cfg.apiKey) {
    handlers.onError(new Error('Missing API key — open Settings and paste one in.'));
    return;
  }

  let acc = '';

  try {
    const resp = await fetch('/api/proxy/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey.trim() || undefined,
        model: cfg.model,
        systemPrompt: system,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => '');
      handlers.onError(new Error(`proxy ${resp.status}: ${text || 'no body'}`));
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        const parsed = parseSseFrame(frame);
        if (!parsed || parsed.kind !== 'event') continue;

        if (parsed.event === 'delta') {
          const text = String(parsed.data.text ?? '');
          if (text) {
            acc += text;
            handlers.onDelta(text);
          }
          continue;
        }

        if (parsed.event === 'error') {
          handlers.onError(new Error(String(parsed.data.message ?? 'proxy error')));
          return;
        }

        if (parsed.event === 'end') {
          handlers.onDone(acc);
          return;
        }
      }
    }

    handlers.onDone(acc);
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    handlers.onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * API mode is always OpenAI-compatible now; this helper remains for older
 * call sites and tests.
 */
export function isOpenAICompatible(model: string, baseUrl: string): boolean {
  void model;
  void baseUrl;
  return true;
}
