"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { BookOpen, Brain, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">H2M AI</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Learn smarter with
            <br />
            <span className="text-primary">AI-powered tutoring</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Upload your documents, chat with AI, take quizzes, and track your
            progress — all in one place.
          </p>

          <div className="space-y-4 pt-4">
            <FeatureItem
              icon={<BookOpen className="size-5" />}
              title="Document Intelligence"
              description="Upload PDFs, DOCX, PPTX and let AI understand your content"
            />
            <FeatureItem
              icon={<Sparkles className="size-5" />}
              title="Socratic Learning"
              description="AI guides you through questions instead of giving direct answers"
            />
            <FeatureItem
              icon={<Brain className="size-5" />}
              title="Adaptive Quizzes"
              description="AI-generated quizzes that adapt to your knowledge level"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} H2M AI. Built for learners.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
