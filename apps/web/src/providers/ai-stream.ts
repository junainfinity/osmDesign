import type { AppConfig, ChatMessage } from '../types';
import { isOpenAICompatible, streamMessageOpenAI } from './openai-compatible';

// Re-export for convenience
export { isOpenAICompatible } from './openai-compatible';

export interface StreamHandlers {
  onDelta: (textDelta: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: Error) => void;
}

export async function streamMessage(
  cfg: AppConfig,
  system: string,
  history: ChatMessage[],
  signal: AbortSignal,
  handlers: StreamHandlers,
): Promise<void> {
  return streamMessageOpenAI(cfg, system, history, signal, handlers);
}
