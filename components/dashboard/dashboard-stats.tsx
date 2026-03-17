"use client";

import {
  FolderKanban,
  MessageSquare,
  Trophy,
  Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProgressStats } from "@/lib/types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  color: string;
}

function StatCard({ icon, label, value, description, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="size-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
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
        description={`${stats?.total_conversations ?? 0} conversations`}
        color="bg-primary/10"
      />
      <StatCard
        icon={<MessageSquare className="size-5 text-blue-600 dark:text-blue-400" />}
        label="Messages"
        value={stats?.total_messages ?? 0}
        description="Total AI interactions"
        color="bg-blue-500/10"
      />
      <StatCard
        icon={<Trophy className="size-5 text-amber-600 dark:text-amber-400" />}
        label="Quizzes Taken"
        value={stats?.total_quizzes_taken ?? 0}
        description={`Avg. ${stats?.average_quiz_score?.toFixed(0) ?? 0}% score`}
        color="bg-amber-500/10"
      />
      <StatCard
        icon={<Flame className="size-5 text-orange-600 dark:text-orange-400" />}
        label="Study Streak"
        value={`${stats?.study_streak ?? 0} days`}
        description={`${stats?.topics_mastered ?? 0}/${stats?.total_topics ?? 0} topics mastered`}
        color="bg-orange-500/10"
      />
    </div>
  );
}
