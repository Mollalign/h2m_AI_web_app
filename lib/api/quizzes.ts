import apiClient from "./client";
import type { Quiz, QuizAttempt, Difficulty } from "@/lib/types";

export const quizzesApi = {
  generate: async (
    projectId: string,
    params: {
      topic_ids?: string[];
      difficulty?: Difficulty;
      question_count?: number;
    }
  ): Promise<Quiz> => {
    const { data } = await apiClient.post(
      `/projects/${projectId}/quizzes/generate`,
      params
    );
    return data;
  },

  list: async (projectId: string): Promise<Quiz[]> => {
    const { data } = await apiClient.get(`/projects/${projectId}/quizzes`);
    return data;
  },

  get: async (quizId: string): Promise<Quiz> => {
    const { data } = await apiClient.get(`/quizzes/${quizId}`);
    return data;
  },

  submit: async (
    quizId: string,
    answers: Record<string, string>,
    timeTaken?: number
  ): Promise<QuizAttempt> => {
    const { data } = await apiClient.post(`/quizzes/${quizId}/submit`, {
      answers,
      time_taken_seconds: timeTaken,
    });
    return data;
  },

  getAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const { data } = await apiClient.get(`/quizzes/${quizId}/attempts`);
    return data;
  },

  getAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    const { data } = await apiClient.get(`/quizzes/attempts/${attemptId}`);
    return data;
  },

  delete: async (quizId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}`);
  },
};
