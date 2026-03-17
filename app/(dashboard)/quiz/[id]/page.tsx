"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Loader2,
  RotateCcw,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { quizzesApi } from "@/lib/api/quizzes";
import type { Quiz, QuizQuestion, QuizAttempt, QuizResponse } from "@/lib/types";

type QuizState = "taking" | "submitting" | "results";

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>("taking");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizzesApi.get(id),
  });

  const submitMutation = useMutation({
    mutationFn: () => quizzesApi.submit(id, answers, timeElapsed),
    onSuccess: (data) => {
      setAttempt(data);
      setQuizState("results");
    },
  });

  useEffect(() => {
    if (quizState !== "taking") return;
    const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [quizState]);

  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    setQuizState("submitting");
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="size-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-[15px] font-semibold mb-1">Quiz not found</h2>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (quizState === "results" && attempt) {
    return (
      <QuizResults
        quiz={quiz}
        attempt={attempt}
        answers={answers}
        timeElapsed={timeElapsed}
        formatTime={formatTime}
        onRetake={() => {
          setAnswers({});
          setCurrentIndex(0);
          setTimeElapsed(0);
          setAttempt(null);
          setQuizState("taking");
        }}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold tracking-[-0.02em] truncate">{quiz.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className={`text-[10px] h-5 ${difficultyColors[quiz.difficulty]}`}>
              {quiz.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
          <Clock className="size-3.5" />
          {formatTime(timeElapsed)}
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary text-xs font-bold">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-muted-foreground">
              of {questions.length}
            </span>
            {currentQuestion.question_type === "code_output" && (
              <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                <Code2 className="size-3" />
                Code
              </Badge>
            )}
          </div>

          <p className="text-[15px] font-medium leading-[1.7] mb-2">
            {currentQuestion.question_text}
          </p>

          {currentQuestion.code_snippet && (
            <pre className="bg-muted/70 border rounded-xl p-4 text-sm font-mono overflow-x-auto mb-5 leading-relaxed">
              {currentQuestion.code_snippet}
            </pre>
          )}

          <div className="space-y-2 mt-5">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = answers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(currentQuestion.id, key)}
                  className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center size-7 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {key}
                  </span>
                  <span className="text-sm leading-[1.6] pt-0.5">{value}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="h-9"
        >
          <ArrowLeft className="size-4" />
          Previous
        </Button>

        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`size-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-primary scale-125"
                  : answers[questions[i].id]
                  ? "bg-primary/40"
                  : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="h-9"
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < questions.length || submitMutation.isPending}
            className="h-9"
          >
            {submitMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResults({
  quiz,
  attempt,
  answers,
  timeElapsed,
  formatTime,
  onRetake,
  onBack,
}: {
  quiz: Quiz;
  attempt: QuizAttempt;
  answers: Record<string, string>;
  timeElapsed: number;
  formatTime: (s: number) => string;
  onRetake: () => void;
  onBack: () => void;
}) {
  const questions = quiz.questions ?? [];
  const responses = attempt.responses ?? [];
  const responseMap = new Map(responses.map((r) => [r.question_id, r]));
  const passed = attempt.passed;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-bold tracking-[-0.02em]">Quiz Results</h1>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center py-4">
            <div
              className={`size-20 rounded-2xl flex items-center justify-center mb-4 ${
                passed ? "bg-green-500/10" : "bg-amber-500/10"
              }`}
            >
              <Trophy
                className={`size-9 ${passed ? "text-green-600" : "text-amber-600"}`}
              />
            </div>
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] mb-1">
              {attempt.percentage?.toFixed(0) ?? Math.round((attempt.score / attempt.max_score) * 100)}%
            </h2>
            <p className="text-sm text-muted-foreground">
              {attempt.score}/{attempt.max_score} points
            </p>
            <Badge
              className={`mt-3 ${
                passed
                  ? "bg-green-500/10 text-green-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {passed ? "Passed" : "Not Passed"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">{responses.filter((r) => r.is_correct).length}</p>
              <p className="text-[11px] text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{responses.filter((r) => !r.is_correct).length}</p>
              <p className="text-[11px] text-muted-foreground">Incorrect</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{formatTime(timeElapsed)}</p>
              <p className="text-[11px] text-muted-foreground">Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetake} className="flex-1 h-10">
          <RotateCcw className="size-4" />
          Retake Quiz
        </Button>
        <Button onClick={onBack} className="flex-1 h-10">
          Done
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold">Review Answers</h3>
        {questions.map((q, i) => {
          const response = responseMap.get(q.id);
          const userAnswer = answers[q.id] ?? response?.user_answer;
          const isCorrect = response?.is_correct ?? userAnswer === q.correct_answer;

          return (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex items-center justify-center size-7 rounded-lg text-xs font-bold shrink-0 ${
                      isCorrect
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-[1.6]">{q.question_text}</p>
                    {q.code_snippet && (
                      <pre className="bg-muted/70 border rounded-lg p-3 text-xs font-mono overflow-x-auto mt-2">
                        {q.code_snippet}
                      </pre>
                    )}
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="size-5 text-red-600 shrink-0" />
                  )}
                </div>

                <div className="space-y-1.5 ml-10">
                  {Object.entries(q.options).map(([key, value]) => {
                    const isUserAnswer = userAnswer === key;
                    const isCorrectAnswer = q.correct_answer === key;
                    let style = "border-transparent bg-transparent";
                    if (isCorrectAnswer) style = "border-green-500/30 bg-green-500/5";
                    if (isUserAnswer && !isCorrect) style = "border-red-500/30 bg-red-500/5";

                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-2 rounded-lg border p-2.5 text-sm ${style}`}
                      >
                        <span
                          className={`flex items-center justify-center size-5 rounded text-[10px] font-bold shrink-0 ${
                            isCorrectAnswer
                              ? "bg-green-500 text-white"
                              : isUserAnswer
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {key}
                        </span>
                        <span className="text-[13px] leading-[1.5]">{value}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 ml-10 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                    <p className="text-xs text-muted-foreground leading-[1.6]">{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
