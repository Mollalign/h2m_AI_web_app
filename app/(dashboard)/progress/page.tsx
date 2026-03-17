"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Trophy,
  Flame,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { knowledgeApi } from "@/lib/api/knowledge";

export default function ProgressPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: knowledgeApi.getProgressStats,
  });

  const { data: quizHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["progress", "quiz-history"],
    queryFn: () => knowledgeApi.getQuizHistory({ limit: 10 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em]">Progress</h1>
        <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">
          Track your learning journey and achievements
        </p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="label-caps">Study Streak</p>
                <p className="text-3xl font-extrabold tracking-[-0.02em]">{stats?.study_streak ?? 0}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500/10 transition-transform duration-200 group-hover:scale-110">
                <Flame className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="label-caps">Avg. Quiz Score</p>
                <p className="text-3xl font-extrabold tracking-[-0.02em]">{stats?.avg_quiz_score?.toFixed(0) ?? 0}%</p>
                <p className="text-xs text-muted-foreground">{stats?.total_quiz_attempts ?? 0} quizzes</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 transition-transform duration-200 group-hover:scale-110">
                <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="label-caps">Topics Mastered</p>
                <p className="text-3xl font-extrabold tracking-[-0.02em]">{stats?.knowledge?.topics_mastered ?? 0}</p>
                <p className="text-xs text-muted-foreground">of {stats?.knowledge?.total_topics ?? 0} total</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-green-500/10 transition-transform duration-200 group-hover:scale-110">
                <Target className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            {stats && (stats.knowledge?.total_topics ?? 0) > 0 && (
              <Progress value={((stats.knowledge?.topics_mastered ?? 0) / (stats.knowledge?.total_topics ?? 1)) * 100} className="mt-4 h-1.5" />
            )}
          </div>

          <div className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="label-caps">AI Interactions</p>
                <p className="text-3xl font-extrabold tracking-[-0.02em]">{stats?.total_conversations ?? 0}</p>
                <p className="text-xs text-muted-foreground">{stats?.total_quiz_attempts ?? 0} quiz attempts</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                <Brain className="size-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center gap-2 p-5 pb-4">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="text-[13px] font-semibold">Recent Quiz Attempts</h2>
        </div>
        <div className="px-5 pb-5">
          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !quizHistory?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Trophy className="size-6 text-muted-foreground" />
              </div>
              <p className="text-[15px] font-semibold mb-1">No quiz attempts yet</p>
              <p className="text-xs text-muted-foreground leading-[1.6]">
                Take a quiz to see your results here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizHistory.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center gap-4 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      attempt.passed ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {attempt.passed ? (
                      <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="size-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {attempt.quiz?.title || "Quiz"}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>
                        {attempt.score}/{attempt.max_score} points
                      </span>
                      {attempt.time_taken_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {Math.floor(attempt.time_taken_seconds / 60)}m
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant={attempt.passed ? "default" : "secondary"}
                      className={`text-[10px] h-5 ${
                        attempt.passed ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" : ""
                      }`}
                    >
                      {attempt.percentage.toFixed(0)}%
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(attempt.started_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
