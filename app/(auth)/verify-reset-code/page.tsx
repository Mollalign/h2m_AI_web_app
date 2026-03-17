"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import {
  verifyResetCodeSchema,
  type VerifyResetCodeFormData,
} from "@/lib/validations/auth";

function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyResetCodeFormData>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  const onSubmit = async (data: VerifyResetCodeFormData) => {
    setIsLoading(true);
    try {
      await authApi.verifyResetCode(email, data.code);
      toast.success("Code verified!");
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&code=${data.code}`
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Invalid or expired reset code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Verify reset code</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Reset code</Label>
          <Input
            id="code"
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-[0.5em] font-mono"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {isLoading ? "Verifying..." : "Verify code"}
        </Button>
      </form>
    </div>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyResetCodeForm />
    </Suspense>
  );
}
