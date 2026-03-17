import apiClient from "./client";
import type { StudyPlan, ExamReadiness } from "@/lib/types";

export const smartTutorApi = {
  getAdaptiveDifficulty: async (
    projectId: string
  ): Promise<{ difficulty: string; reason: string }> => {
    const { data } = await apiClient.get(
      `/smart/adaptive-difficulty/${projectId}`
    );
    return data;
  },

  getSuggestions: async (): Promise<
    Array<{ topic: string; reason: string; project_id: string }>
  > => {
    const { data } = await apiClient.get("/smart/suggestions");
    return data;
  },

  getStudyPlan: async (projectId: string): Promise<StudyPlan> => {
    const { data } = await apiClient.get(`/smart/study-plan/${projectId}`);
    return data;
  },

  getExamReadiness: async (projectId: string): Promise<ExamReadiness> => {
    const { data } = await apiClient.get(`/smart/readiness/${projectId}`);
    return data;
  },

  getCrossConnections: async (
    projectId: string
  ): Promise<Array<{ from: string; to: string; connection: string }>> => {
    const { data } = await apiClient.get(`/smart/connections/${projectId}`);
    return data;
  },

  getLearningStyle: async (): Promise<{
    style: string;
    description: string;
    recommendations: string[];
  }> => {
    const { data } = await apiClient.get("/smart/learning-style");
    return data;
  },
};
