import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenrouterMessagesQueryKey } from "@workspace/api-client-react";
import { type StorySettings } from "@/hooks/use-settings";

export interface DebugEntry {
  id: number;
  at: string;
  endpoint: string;
  method: string;
  status: number | null;
  request: unknown;
  response: unknown;
  durationMs: number;
}

let debugIdCounter = 0;
let debugListeners: Array<(entry: DebugEntry) => void> = [];

export function subscribeDebug(fn: (entry: DebugEntry) => void): () => void {
  debugListeners.push(fn);
  return () => {
    debugListeners = debugListeners.filter((l) => l !== fn);
  };
}

function emitDebug(entry: Omit<DebugEntry, "id" | "at">): void {
  const full: DebugEntry = {
    ...entry,
    id: ++debugIdCounter,
    at: new Date().toISOString(),
  };
  for (const fn of debugListeners) fn(full);
}

function buildOptionsBody(settings?: StorySettings): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (!settings) return body;
  body.model = settings.model || "openrouter/free";
  body.maxTokens = settings.maxTokens;
  body.temperature = settings.temperature;
  if (settings.apiKey) body.apiKey = settings.apiKey;
  if (settings.apiUrl) body.apiUrl = settings.apiUrl;
  // Pin the AI's response language so the AI replies in whatever language
  // the user has chosen, even if the conversation history is in another
  // language. We reuse the TTS playback language because the user almost
  // always wants the spoken voice to match the generated text.
  if (settings.stt?.aiLanguage) body.language = settings.stt.aiLanguage;
  return body;
}

export function useStoryStream(conversationId: number, settings?: StorySettings) {
  const [isTyping, setIsTyping] = useState(false);
  const [streamedContent] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getListOpenrouterMessagesQueryKey(conversationId),
    });
  }, [conversationId, queryClient]);

  const submitUserMessage = useCallback(
    async (content: string): Promise<boolean> => {
      setStreamError(null);
      const endpoint = `/api/openrouter/conversations/${conversationId}/messages`;
      // Tag the saved user message with the BCP-47 language they were
      // speaking/typing in. The server stores this so later TTS playback can
      // pick a matching voice even when the conversation mixes languages.
      const requestBody: Record<string, unknown> = {
        content,
        skipAiCompletion: true,
      };
      if (settings?.stt?.language) {
        requestBody.language = settings.stt.language;
      }
      const start = performance.now();
      let status: number | null = null;
      let responseJson: unknown = null;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        status = response.status;
        responseJson = await response.json().catch(() => null);
        if (!response.ok) {
          const msg =
            (responseJson as { error?: string } | null)?.error ??
            `Server error ${response.status}: ${response.statusText}`;
          throw new Error(msg);
        }
        invalidate();
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Error submitting user message:", error);
        setStreamError(`[${status ?? "ERR"}] ${msg}`);
        return false;
      } finally {
        emitDebug({
          endpoint,
          method: "POST",
          status,
          request: requestBody,
          response: responseJson,
          durationMs: Math.round(performance.now() - start),
        });
      }
    },
    [conversationId, settings, invalidate],
  );

  const requestAiTurn = useCallback(async (): Promise<boolean> => {
    setIsTyping(true);
    setStreamError(null);

    const endpoint = `/api/openrouter/conversations/${conversationId}/ai-turn`;
    const requestBody = buildOptionsBody(settings);
    const start = performance.now();
    let status: number | null = null;
    let responseJson: unknown = null;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      status = response.status;
      responseJson = await response.json().catch(() => null);

      if (!response.ok) {
        const msg =
          (responseJson as { error?: string } | null)?.error ??
          `Server error ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error requesting AI turn:", error);
      setStreamError(`[${status ?? "ERR"}] ${msg}`);
      return false;
    } finally {
      setIsTyping(false);
      invalidate();
      emitDebug({
        endpoint,
        method: "POST",
        status,
        request: requestBody,
        response: responseJson,
        durationMs: Math.round(performance.now() - start),
      });
    }
  }, [conversationId, settings, invalidate]);

  const sendMessage = useCallback(
    async (content: string, options: { autoAiTurn?: boolean } = {}): Promise<void> => {
      const ok = await submitUserMessage(content);
      if (!ok) return;
      if (options.autoAiTurn) {
        await requestAiTurn();
      }
    },
    [submitUserMessage, requestAiTurn],
  );

  const clearError = useCallback(() => setStreamError(null), []);

  return {
    submitUserMessage,
    requestAiTurn,
    sendMessage,
    isTyping,
    streamedContent,
    streamError,
    clearError,
  };
}
