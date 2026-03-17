"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth-store";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const initGoogle = () => {
    if (!window.google || !GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          await googleLogin(response.credential);
          toast.success("Welcome!");
          router.push("/dashboard");
        } catch {
          toast.error("Google sign-in failed");
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: "400",
      text: "signin_with",
      shape: "pill",
    });
  };

  useEffect(() => {
    initGoogle();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Invalid email or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="lg:hidden space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Brain className="size-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-[-0.02em]">H2M AI</span>
            <p className="text-[11px] text-muted-foreground leading-tight">AI-powered learning</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-[1.625rem] sm:text-[1.75rem] font-extrabold tracking-[-0.03em]">Welcome back</h2>
        <p className="text-[13px] sm:text-[13.5px] text-muted-foreground leading-[1.6]">
          Sign in to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="label-caps">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="label-caps">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-11 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 text-[13px] font-semibold tracking-wide" disabled={isLoading}>
          {isLoading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div ref={googleBtnRef} />
          </div>

          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initGoogle}
          />
        </>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">New here?</span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/register" className="font-medium text-foreground hover:text-primary transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}
