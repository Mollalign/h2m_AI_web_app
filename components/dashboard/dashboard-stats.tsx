"use client";

import {
  FolderKanban,
  MessageSquare,
  Trophy,
  Flame,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProgressStats } from "@/lib/types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail?: string;
  trend?: string;
  iconBg: string;
}

function StatCard({ icon, label, value, detail, iconBg }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="label-caps">{label}</p>
          <p className="text-3xl font-extrabold tracking-[-0.02em]">{value}</p>
          {detail && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3" />
              {detail}
            </p>
          )}
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="size-11 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardStats({
  stats,
  isLoading,
}: {
  stats: ProgressStats | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<FolderKanban className="size-5 text-primary" />}
        label="Projects"
        value={stats?.total_projects ?? 0}
        detail={`${stats?.total_conversations ?? 0} conversations`}
        iconBg="bg-primary/10"
      />
      <StatCard
        icon={<MessageSquare className="size-5 text-blue-600 dark:text-blue-400" />}
        label="Conversations"
        value={stats?.total_conversations ?? 0}
        detail={`${stats?.quizzes_this_week ?? 0} quizzes this week`}
        iconBg="bg-blue-500/10"
      />
      <StatCard
        icon={<Trophy className="size-5 text-amber-600 dark:text-amber-400" />}
        label="Quizzes"
        value={stats?.total_quiz_attempts ?? 0}
        detail={`${stats?.avg_quiz_score?.toFixed(0) ?? 0}% avg score`}
        iconBg="bg-amber-500/10"
      />
      <StatCard
        icon={<Flame className="size-5 text-orange-600 dark:text-orange-400" />}
        label="Streak"
        value={`${stats?.study_streak ?? 0}d`}
        detail={`${stats?.knowledge?.topics_mastered ?? 0}/${stats?.knowledge?.total_topics ?? 0} mastered`}
        iconBg="bg-orange-500/10"
      />
    </div>
  );
}
