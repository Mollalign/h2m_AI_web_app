import apiClient, { API_BASE_URL } from "./client";
import type {
  Conversation,
  ConversationDetail,
  Message,
} from "@/lib/types";

export const conversationsApi = {
  list: async (params?: {
    project_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<Conversation[]> => {
    const { data } = await apiClient.get("/conversations", { params });
    return data.conversations ?? data;
  },

  get: async (id: string): Promise<ConversationDetail> => {
    const { data } = await apiClient.get(`/conversations/${id}`);
    return data;
  },

  create: async (conversation: {
    title?: string;
    project_id?: string;
    is_socratic?: boolean;
  }): Promise<Conversation> => {
    const { data } = await apiClient.post("/conversations", conversation);
    return data;
  },

  update: async (
    id: string,
    updates: Partial<Pick<Conversation, "title" | "is_socratic">>
  ): Promise<Conversation> => {
    const { data } = await apiClient.patch(`/conversations/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    attachments?: string[]
  ): Promise<Message> => {
    const { data } = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      { content, attachments }
    );
    return data;
  },

  streamMessage: (
    conversationId: string,
    content: string,
    onSource: (sources: unknown[]) => void,
    onContent: (chunk: string) => void,
    onDone: (message: Record<string, unknown>) => void,
    onError: (error: string) => void
  ): AbortController => {
    const controller = new AbortController();
    const token = localStorage.getItem("access_token");

    fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: content }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          onError(error.detail || "Stream failed");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const jsonData = line.slice(5).trim();
              if (!jsonData) continue;

              try {
                const parsed = JSON.parse(jsonData);
                switch (currentEvent) {
                  case "sources":
                    onSource(parsed.sources ?? parsed);
                    break;
                  case "content":
                    onContent(parsed.text ?? parsed.content ?? "");
                    break;
                  case "done":
                    onDone(parsed);
                    break;
                  case "error":
                    onError(parsed.error ?? parsed.detail ?? "Stream error");
                    break;
                  default:
                    if (typeof parsed === "string") {
                      onContent(parsed);
                    } else if (parsed.text) {
                      onContent(parsed.text);
                    }
                    break;
                }
              } catch {
                if (currentEvent === "content") {
                  onContent(jsonData);
                }
              }
              currentEvent = "";
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error.message);
        }
      });

    return controller;
  },
};
