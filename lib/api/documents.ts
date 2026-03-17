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

  download: async (projectId: string, documentId: string): Promise<void> => {
    const response = await apiClient.get(
      `/projects/${projectId}/documents/${documentId}/download`,
      { responseType: "blob" }
    );
    const blob = new Blob([response.data]);
    const contentDisposition = response.headers["content-disposition"];
    let filename = "document";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
