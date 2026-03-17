import apiClient from "./client";
import type { KnowledgeState, ProgressStats, QuizAttempt } from "@/lib/types";

export const knowledgeApi = {
  getProjectKnowledge: async (
    projectId: string
  ): Promise<KnowledgeState[]> => {
    const { data } = await apiClient.get(`/projects/${projectId}/knowledge`);
    return data;
  },

  getProgressStats: async (): Promise<ProgressStats> => {
    const { data } = await apiClient.get("/progress/stats");
    return data;
  },

  getQuizHistory: async (params?: {
    limit?: number;
  }): Promise<QuizAttempt[]> => {
    const { data } = await apiClient.get("/progress/quiz-history", { params });
    return data;
  },
};
