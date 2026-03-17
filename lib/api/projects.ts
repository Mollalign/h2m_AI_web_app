import apiClient from "./client";
import type { Project, PaginatedResponse } from "@/lib/types";

export const projectsApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    is_archived?: boolean;
  }): Promise<PaginatedResponse<Project>> => {
    const { data } = await apiClient.get("/projects", { params });
    return data;
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  create: async (project: {
    name: string;
    description?: string;
  }): Promise<Project> => {
    const { data } = await apiClient.post("/projects", project);
    return data;
  },

  update: async (
    id: string,
    updates: Partial<Pick<Project, "name" | "description" | "is_archived">>
  ): Promise<Project> => {
    const { data } = await apiClient.patch(`/projects/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
