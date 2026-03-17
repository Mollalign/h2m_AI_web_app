"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Brain } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="size-7 text-primary" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border-2 border-primary/20 animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium tracking-tight">H2M AI</p>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
