"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Sparkles,
  Trash2,
  Trophy,
  Clock,
  Loader2,
  Play,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quizzesApi } from "@/lib/api/quizzes";
import { smartTutorApi } from "@/lib/api/smart-tutor";
import type { Quiz, Topic, Difficulty } from "@/lib/types";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function ProjectQuizzes({
  projectId,
  quizzes,
  topics,
}: {
  projectId: string;
  quizzes: Quiz[] | undefined;
  topics: Topic[] | undefined;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [useAdaptive, setUseAdaptive] = useState(false);

  const { data: adaptiveDifficulty } = useQuery({
    queryKey: ["adaptive-difficulty", projectId],
    queryFn: () => smartTutorApi.getAdaptiveDifficulty(projectId),
    enabled: showGenerate,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      quizzesApi.generate(projectId, {
        difficulty,
        question_count: parseInt(questionCount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", projectId] });
      setShowGenerate(false);
      toast.success("Quiz generated!");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Failed to generate quiz";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", projectId] });
      toast.success("Quiz deleted");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowGenerate(true)}>
          <Sparkles className="size-4" />
          Generate Quiz
        </Button>
      </div>

      {!quizzes?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="size-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No quizzes yet</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => setShowGenerate(true)}
          >
            Generate your first quiz with AI
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="transition-all hover:border-primary/30"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <BookOpen className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{quiz.title}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs mt-0.5 ${difficultyColors[quiz.difficulty]}`}
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteMutation.mutate(quiz.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1">
                    <Trophy className="size-3" />
                    {quiz.question_count} questions
                  </span>
                  {quiz.time_limit_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {quiz.time_limit_minutes} min
                    </span>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(quiz.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3 h-8 text-xs font-semibold"
                  onClick={() => router.push(`/quiz/${quiz.id}`)}
                >
                  <Play className="size-3" />
                  Take Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Generate Quiz
            </DialogTitle>
            <DialogDescription>
              AI will generate questions from your uploaded documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {adaptiveDifficulty && (
              <button
                type="button"
                onClick={() => {
                  setUseAdaptive(!useAdaptive);
                  if (!useAdaptive) {
                    setDifficulty(adaptiveDifficulty.difficulty as Difficulty);
                  }
                }}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                  useAdaptive
                    ? "border-primary bg-primary/5"
                    : "hover:border-border/80 hover:bg-muted/30"
                }`}
              >
                <Zap className={`size-4 ${useAdaptive ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left flex-1">
                  <p className="text-xs font-semibold">Adaptive Difficulty</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Recommended: {adaptiveDifficulty.difficulty} &mdash; {adaptiveDifficulty.reason}
                  </p>
                </div>
              </button>
            )}

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => {
                  setDifficulty(v as Difficulty);
                  setUseAdaptive(false);
                }}
                disabled={useAdaptive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGenerate(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {generateMutation.isPending ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
