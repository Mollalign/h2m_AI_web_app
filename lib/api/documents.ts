import apiClient from "./client";
import type { Document } from "@/lib/types";

export const documentsApi = {
  list: async (
    projectId: string,
    params?: { status?: string; file_type?: string }
  ): Promise<Document[]> => {
    const { data } = await apiClient.get(
      `/projects/${projectId}/documents`,
      { params }
    );
    return data;
  },

  get: async (projectId: string, documentId: string): Promise<Document> => {
    const { data } = await apiClient.get(
      `/projects/${projectId}/documents/${documentId}`
    );
    return data;
  },

  upload: async (projectId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(
      `/projects/${projectId}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      }
    );
    return data;
  },

  delete: async (projectId: string, documentId: string): Promise<void> => {
    await apiClient.delete(
      `/projects/${projectId}/documents/${documentId}`
    );
  },

  reprocess: async (
    projectId: string,
    documentId: string
  ): Promise<Document> => {
    const { data } = await apiClient.post(
      `/projects/${projectId}/documents/${documentId}/reprocess`
    );
    return data;
  },

  getStats: async (
    projectId: string
  ): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    total_size: number;
  }> => {
    const { data } = await apiClient.get(
      `/projects/${projectId}/documents/stats`
    );
    return data;
  },

  getAllowedTypes: async (): Promise<string[]> => {
    const { data } = await apiClient.get(
      "/projects/documents/info/allowed-types"
    );
    return data;
  },
};
