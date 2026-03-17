"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { BookOpen, Brain, Sparkles, Zap } from "lucide-react";

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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Brain className="size-6 text-primary" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-gradient-to-br from-primary/[0.08] via-background to-background p-10 xl:p-14">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -left-20 bottom-20 size-72 rounded-full bg-primary/[0.04] blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Brain className="size-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-[-0.02em]">H2M AI</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
              Beta
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <h1 className="heading-display text-4xl xl:text-[3.25rem]">
              Learn smarter with{" "}
              <span className="text-gradient">AI-powered</span>{" "}
              tutoring
            </h1>
            <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-md">
              Upload your documents, chat with AI, take adaptive quizzes, and
              track your mastery — all in one beautiful platform.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/20 hover:bg-card/60"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-semibold text-[13px]">{feature.title}</p>
                  <p className="text-[12.5px] text-muted-foreground leading-[1.6] mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} H2M AI &middot; Built for learners
        </p>
      </div>

      <div className="flex flex-col min-h-screen lg:min-h-0">
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 xl:px-16">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/50 pb-6 lg:hidden">
          &copy; {new Date().getFullYear()} H2M AI &middot; Built for learners
        </p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: <BookOpen className="size-5" />,
    title: "Document Intelligence",
    description: "Upload PDFs, DOCX, PPTX and let AI deeply understand your content",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "Socratic Learning",
    description: "AI guides you through questions rather than giving direct answers",
  },
  {
    icon: <Zap className="size-5" />,
    title: "Adaptive Quizzes",
    description: "AI-generated quizzes that adapt to your knowledge level in real-time",
  },
];
