"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  Trophy,
  Flame,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Streak</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.study_streak ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
                    <Flame className="size-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Quiz Score</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.average_quiz_score?.toFixed(0) ?? 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.total_quizzes_taken ?? 0} quizzes taken
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Topics Mastered</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.topics_mastered ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {stats?.total_topics ?? 0} total
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10">
                    <Target className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                {stats && stats.total_topics > 0 && (
                  <Progress
                    value={(stats.topics_mastered / stats.total_topics) * 100}
                    className="mt-3 h-1.5"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Interactions</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.total_messages ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.total_conversations ?? 0} conversations
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Brain className="size-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5 text-primary" />
            Recent Quiz Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !quizHistory?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Trophy className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                No quiz attempts yet. Take a quiz to see your results!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      attempt.passed
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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
                      className={
                        attempt.passed
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      {attempt.percentage.toFixed(0)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(attempt.started_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
