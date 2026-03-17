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
  Sparkles,
} from "lucide-react";
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
    new_password: z.string().min(8, "Password must be at least 8 characters"),
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
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferences updated");
    },
  });

  const socraticMutation = useMutation({
    mutationFn: (enabled: boolean) => authApi.updateProfile({ default_socratic_mode: enabled }),
    onSuccess: (updatedUser) => updateUser(updatedUser),
  });

  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em]">Settings</h1>
        <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">Manage your account and preferences</p>
      </div>

      <section className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 p-5 pb-4">
          <User className="size-4 text-primary" />
          <h2 className="text-[13px] font-semibold">Profile</h2>
        </div>
        <Separator />
        <div className="p-5">
          <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 rounded-2xl">
                <AvatarFallback className="rounded-2xl text-base bg-primary/10 text-primary" style={{ backgroundColor: user?.avatar_color || undefined, color: user?.avatar_color ? "white" : undefined }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="label-caps">Full name</Label>
              <Input id="full_name" className="h-10" {...profileForm.register("full_name")} />
              {profileForm.formState.errors.full_name && <p className="text-xs text-destructive">{profileForm.formState.errors.full_name.message}</p>}
            </div>
            <Button type="submit" size="sm" disabled={profileMutation.isPending} className="h-8 text-xs font-semibold">
              <Save className="size-3.5" />
              Save changes
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 p-5 pb-4">
          {theme === "dark" ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-primary" />}
          <h2 className="text-[13px] font-semibold">Appearance</h2>
        </div>
        <Separator />
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                  theme === value ? "border-primary bg-primary/5 shadow-sm" : "hover:border-border/80 hover:bg-muted/50"
                }`}
              >
                <Icon className={`size-4 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" />
                <Label className="text-sm font-medium">Socratic Mode</Label>
              </div>
              <p className="text-xs text-muted-foreground leading-[1.6] mt-0.5 ml-5.5">New conversations default to Socratic method</p>
            </div>
            <Switch checked={user?.default_socratic_mode ?? false} onCheckedChange={(checked) => socraticMutation.mutate(checked)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 p-5 pb-4">
          <Bell className="size-4 text-primary" />
          <h2 className="text-[13px] font-semibold">Notifications</h2>
        </div>
        <Separator />
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Study Reminders</Label>
              <p className="text-xs text-muted-foreground leading-[1.6] mt-0.5">Daily reminders to keep your streak</p>
            </div>
            <Switch checked={notifPrefs?.study_reminders_enabled ?? false} onCheckedChange={(checked) => notifMutation.mutate({ study_reminders_enabled: checked })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Quiz Results</Label>
              <p className="text-xs text-muted-foreground leading-[1.6] mt-0.5">Notifications about quiz completions</p>
            </div>
            <Switch checked={notifPrefs?.quiz_results_enabled ?? false} onCheckedChange={(checked) => notifMutation.mutate({ quiz_results_enabled: checked })} />
          </div>
        </div>
      </section>

      {user?.auth_provider !== "google" && (
        <section className="rounded-2xl border bg-card">
          <div className="flex items-center gap-3 p-5 pb-4">
            <Lock className="size-4 text-primary" />
            <h2 className="text-[13px] font-semibold">Change Password</h2>
          </div>
          <Separator />
          <div className="p-5">
            <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="label-caps">Current password</Label>
                <div className="relative">
                  <Input id="current_password" type={showCurrentPw ? "text" : "password"} className="h-10 pr-10" {...passwordForm.register("current_password")} />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors" tabIndex={-1}>
                    {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password" className="label-caps">New password</Label>
                <div className="relative">
                  <Input id="new_password" type={showNewPw ? "text" : "password"} className="h-10 pr-10" {...passwordForm.register("new_password")} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors" tabIndex={-1}>
                    {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.new_password && <p className="text-xs text-destructive">{passwordForm.formState.errors.new_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="label-caps">Confirm new password</Label>
                <Input id="confirm_password" type="password" className="h-10" {...passwordForm.register("confirm_password")} />
                {passwordForm.formState.errors.confirm_password && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm_password.message}</p>}
              </div>
              <Button type="submit" size="sm" disabled={passwordMutation.isPending} className="h-8 text-xs font-semibold">
                {passwordMutation.isPending ? <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Lock className="size-3.5" />}
                Change Password
              </Button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
