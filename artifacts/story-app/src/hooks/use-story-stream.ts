import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenrouterMessagesQueryKey } from "@workspace/api-client-react";
import { type StorySettings } from "@/hooks/use-settings";

export function useStoryStream(conversationId: number, settings?: StorySettings) {
  const [isTyping, setIsTyping] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      setIsTyping(true);
      setStreamedContent("");
      setStreamError(null);

      try {
        const body: Record<string, unknown> = { content };
        if (settings) {
          body.model = settings.model || "openrouter/free";
          body.maxTokens = settings.maxTokens;
          body.temperature = settings.temperature;
          if (settings.apiKey) body.apiKey = settings.apiKey;
          if (settings.apiUrl) body.apiUrl = settings.apiUrl;
        }

        const response = await fetch(`/api/openrouter/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Server error ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    setStreamedContent((prev) => prev + data.content);
                  }
                  if (data.done) {
                    done = true;
                  }
                  if (data.error) {
                    throw new Error(data.error);
                  }
                } catch (parseErr) {
                  if (parseErr instanceof SyntaxError) continue;
                  throw parseErr;
                }
              }
            }
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Error streaming message:", error);
        setStreamError(msg);
      } finally {
        setIsTyping(false);
        setStreamedContent("");
        queryClient.invalidateQueries({
          queryKey: getListOpenrouterMessagesQueryKey(conversationId),
        });
      }
    },
    [conversationId, queryClient, settings]
  );

  const clearError = useCallback(() => setStreamError(null), []);

  return { sendMessage, isTyping, streamedContent, streamError, clearError };
}
