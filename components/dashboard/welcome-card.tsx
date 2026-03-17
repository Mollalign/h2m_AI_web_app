"use client";

import type { User } from "@/lib/types";
import { Brain } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function WelcomeCard({ user }: { user: User | null }) {
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent p-8">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/[0.06] blur-3xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
            <Brain className="size-3.5" />
            AI Tutor
          </p>
          <h1 className="heading-display text-2xl sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[13.5px] text-muted-foreground max-w-md leading-[1.7] mt-2">
            Continue your learning journey. Upload documents, chat with AI, or
            test your knowledge with a quiz.
          </p>
        </div>
      </div>
    </div>
  );
}
