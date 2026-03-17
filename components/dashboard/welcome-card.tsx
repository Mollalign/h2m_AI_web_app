"use client";

import type { User } from "@/lib/types";
import { Sparkles } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeCard({ user }: { user: User | null }) {
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="size-5" />
          <span className="text-sm font-medium">AI Tutor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground max-w-lg">
          Ready to continue learning? Upload documents, chat with AI, or take a
          quiz to test your knowledge.
        </p>
      </div>
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-4 right-20 size-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
