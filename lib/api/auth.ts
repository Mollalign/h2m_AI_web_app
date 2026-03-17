import apiClient from "./client";
import type {
  LoginResponse,
  User,
  NotificationPreference,
} from "@/lib/types";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    full_name: string
  ): Promise<LoginResponse> => {
    const { data } = await apiClient.post("/auth/register", {
      email,
      password,
      full_name,
    });
    return data;
  },

  googleAuth: async (id_token: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post("/auth/google", { id_token });
    return data;
  },

  refreshToken: async (refresh_token: string) => {
    const { data } = await apiClient.post("/auth/refresh", { refresh_token });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  updateProfile: async (
    updates: Partial<Pick<User, "full_name" | "avatar_url" | "avatar_color" | "default_socratic_mode">>
  ): Promise<User> => {
    const { data } = await apiClient.patch("/auth/me", updates);
    return data;
  },

  changePassword: async (
    current_password: string,
    new_password: string
  ): Promise<void> => {
    await apiClient.post("/auth/change-password", {
      current_password,
      new_password,
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  verifyResetCode: async (
    email: string,
    reset_code: string
  ): Promise<void> => {
    await apiClient.post("/auth/verify-reset-code", { email, reset_code });
  },

  resetPassword: async (
    email: string,
    reset_code: string,
    new_password: string
  ): Promise<void> => {
    await apiClient.post("/auth/reset-password", {
      email,
      reset_code,
      new_password,
    });
  },

  getNotificationPreferences: async (): Promise<NotificationPreference> => {
    const { data } = await apiClient.get("/auth/notification-preferences");
    return data;
  },

  updateNotificationPreferences: async (
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> => {
    const { data } = await apiClient.patch(
      "/auth/notification-preferences",
      updates
    );
    return data;
  },
};
