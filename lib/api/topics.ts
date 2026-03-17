import apiClient from "./client";
import type { Topic } from "@/lib/types";

export const topicsApi = {
  extract: async (projectId: string): Promise<Topic[]> => {
    const { data } = await apiClient.post(
      `/projects/${projectId}/topics/extract`
    );
    return data;
  },

  list: async (projectId: string): Promise<Topic[]> => {
    const { data } = await apiClient.get(`/projects/${projectId}/topics`);
    return data;
  },
};
