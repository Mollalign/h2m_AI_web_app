"use client";

import { Brain, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { topicsApi } from "@/lib/api/topics";
import type { KnowledgeState, Topic, KnowledgeStatus } from "@/lib/types";

const statusLabels: Record<KnowledgeStatus, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground" },
  learning: { label: "Learning", color: "bg-blue-500/10 text-blue-600" },
  reviewing: { label: "Reviewing", color: "bg-amber-500/10 text-amber-600" },
  mastered: { label: "Mastered", color: "bg-green-500/10 text-green-600" },
};

export function ProjectKnowledge({
  projectId,
  knowledge,
  topics,
}: {
  projectId: string;
  knowledge: KnowledgeState[] | undefined;
  topics: Topic[] | undefined;
}) {
  const queryClient = useQueryClient();

  const extractMutation = useMutation({
    mutationFn: () => topicsApi.extract(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", projectId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge", projectId] });
      toast.success("Topics extracted from documents!");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Failed to extract topics";
      toast.error(message);
    },
  });

  if (!knowledge?.length && !topics?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Brain className="size-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">
          No knowledge data yet. Extract topics from documents or take quizzes.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending}
        >
          {extractMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Extract Topics from Documents
        </Button>
      </div>
    );
  }

  const avgMastery =
    knowledge && knowledge.length > 0
      ? knowledge.reduce((sum, k) => sum + k.mastery_score, 0) /
        knowledge.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending}
          className="h-8 text-xs"
        >
          {extractMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Re-extract Topics
        </Button>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Overall Mastery</p>
            <div className="flex items-center gap-3 mt-1">
              <Progress value={avgMastery * 100} className="flex-1 h-2" />
              <span className="text-sm font-bold">
                {(avgMastery * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {knowledge && knowledge.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Knowledge by Topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {knowledge.map((ks) => {
              const { label, color } = statusLabels[ks.status];
              return (
                <div key={ks.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {ks.topic?.name || "Topic"}
                      </span>
                      <Badge variant="secondary" className={`text-xs ${color}`}>
                        {label}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {ks.correct_count}/{ks.total_attempts} correct
                    </span>
                  </div>
                  <Progress
                    value={ks.mastery_score * 100}
                    className="h-1.5"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
