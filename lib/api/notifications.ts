import apiClient from "./client";
import type { Notification } from "@/lib/types";

export const notificationsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Notification[]> => {
    const { data } = await apiClient.get("/notifications", { params });
    return data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get("/notifications/unread-count");
    return data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post("/notifications/mark-all-read");
  },
};
