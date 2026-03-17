"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { z } from "zod";
import {
  User,
  Moon,
  Sun,
  Monitor,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const { data: notifPrefs } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: authApi.getNotificationPreferences,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: { full_name: user?.full_name || "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.changePassword(data.current_password, data.new_password),
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Password changed");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Failed to change password";
      toast.error(message);
    },
  });

  const notifMutation = useMutation({
    mutationFn: authApi.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-preferences"],
      });
      toast.success("Preferences updated");
    },
  });

  const socraticMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      authApi.updateProfile({ default_socratic_mode: enabled }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    },
  });

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((d) =>
              profileMutation.mutate(d)
            )}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="size-16">
                <AvatarFallback
                  className="text-lg"
                  style={{
                    backgroundColor: user?.avatar_color || undefined,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...profileForm.register("full_name")} />
              {profileForm.formState.errors.full_name && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={profileMutation.isPending}
            >
              <Save className="size-4" />
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="size-5 text-primary" />
            ) : (
              <Sun className="size-5 text-primary" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/30"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <Label>Default Socratic Mode</Label>
              <p className="text-xs text-muted-foreground">
                New conversations will use Socratic method by default
              </p>
            </div>
            <Switch
              checked={user?.default_socratic_mode ?? false}
              onCheckedChange={(checked) => socraticMutation.mutate(checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Study Reminders</Label>
              <p className="text-xs text-muted-foreground">
                Daily reminders to study
              </p>
            </div>
            <Switch
              checked={notifPrefs?.study_reminders_enabled ?? false}
              onCheckedChange={(checked) =>
                notifMutation.mutate({ study_reminders_enabled: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Quiz Results</Label>
              <p className="text-xs text-muted-foreground">
                Notifications about quiz completions
              </p>
            </div>
            <Switch
              checked={notifPrefs?.quiz_results_enabled ?? false}
              onCheckedChange={(checked) =>
                notifMutation.mutate({ quiz_results_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {user?.auth_provider !== "google" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit((d) =>
                passwordMutation.mutate(d)
              )}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPw ? "text" : "password"}
                    {...passwordForm.register("current_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrentPw ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPw ? "text" : "password"}
                    {...passwordForm.register("new_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPw ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...passwordForm.register("confirm_password")}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Lock className="size-4" />
                )}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
