import apiClient from "./client";
import type { SharedConversation, ConversationDetail } from "@/lib/types";

export const sharingApi = {
  createShare: async (params: {
    conversation_id: string;
    title?: string;
    share_type?: "public" | "private";
    allow_replies?: boolean;
    expires_at?: string;
  }): Promise<SharedConversation> => {
    const { data } = await apiClient.post("/shares", params);
    return data;
  },

  listShares: async (): Promise<SharedConversation[]> => {
    const { data } = await apiClient.get("/shares");
    return data;
  },

  getShare: async (shareId: string): Promise<SharedConversation> => {
    const { data } = await apiClient.get(`/shares/${shareId}`);
    return data;
  },

  updateShare: async (
    shareId: string,
    updates: Partial<
      Pick<SharedConversation, "title" | "allow_replies" | "is_active">
    >
  ): Promise<SharedConversation> => {
    const { data } = await apiClient.patch(`/shares/${shareId}`, updates);
    return data;
  },

  deleteShare: async (shareId: string): Promise<void> => {
    await apiClient.delete(`/shares/${shareId}`);
  },

  viewShared: async (token: string): Promise<ConversationDetail> => {
    const { data } = await apiClient.get(`/shared/${token}`);
    return data;
  },

  forkShared: async (token: string): Promise<{ conversation_id: string }> => {
    const { data } = await apiClient.post(`/shared/${token}/fork`);
    return data;
  },

  sharePrivate: async (
    conversationId: string,
    emails: string[]
  ): Promise<void> => {
    await apiClient.post(
      `/conversations/${conversationId}/share-private`,
      { emails }
    );
  },

  getSharedWithMe: async (): Promise<ConversationDetail[]> => {
    const { data } = await apiClient.get("/shared-with-me");
    return data;
  },
};
