"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Brain,
  BookOpen,
  Target,
  Link2,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { smartTutorApi } from "@/lib/api/smart-tutor";
import { projectsApi } from "@/lib/api/projects";

export default function SmartTutorPage() {
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["smart", "suggestions"],
    queryFn: smartTutorApi.getSuggestions,
  });

  const { data: learningStyle, isLoading: styleLoading } = useQuery({
    queryKey: ["smart", "learning-style"],
    queryFn: smartTutorApi.getLearningStyle,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", { size: 10 }],
    queryFn: () => projectsApi.list({ size: 10 }),
  });

  const firstProjectId = projects?.items?.[0]?.id;

  const { data: studyPlan, isLoading: planLoading } = useQuery({
    queryKey: ["smart", "study-plan", firstProjectId],
    queryFn: () => smartTutorApi.getStudyPlan(firstProjectId!),
    enabled: !!firstProjectId,
  });

  const { data: examReadiness, isLoading: readinessLoading } = useQuery({
    queryKey: ["smart", "readiness", firstProjectId],
    queryFn: () => smartTutorApi.getExamReadiness(firstProjectId!),
    enabled: !!firstProjectId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          Smart Tutor
        </h1>
        <p className="text-muted-foreground">
          AI-powered insights and personalized learning recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-5 text-amber-500" />
              Topic Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !suggestions?.length ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Brain className="size-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Take some quizzes first to get personalized suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Target className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="size-5 text-purple-500" />
              Learning Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            {styleLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : !learningStyle ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Brain className="size-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Interact more with the AI to detect your learning style
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge className="text-sm">{learningStyle.style}</Badge>
                <p className="text-sm text-muted-foreground">
                  {learningStyle.description}
                </p>
                {learningStyle.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recommendations
                    </p>
                    <ul className="space-y-1.5">
                      {learningStyle.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {firstProjectId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="size-5 text-primary" />
                  Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {planLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : !studyPlan ? (
                  <p className="text-sm text-muted-foreground">
                    Upload documents and take quizzes to get a study plan
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {studyPlan.plan}
                    </p>
                    {studyPlan.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {studyPlan.topics.map((topic, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {studyPlan.estimated_hours > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Estimated time: {studyPlan.estimated_hours}h
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-5 text-green-500" />
                  Exam Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                {readinessLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : !examReadiness ? (
                  <p className="text-sm text-muted-foreground">
                    Take quizzes to see your exam readiness
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Readiness Score
                        </span>
                        <span className="text-lg font-bold">
                          {(examReadiness.readiness_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={examReadiness.readiness_score * 100}
                        className="h-2"
                      />
                    </div>

                    {examReadiness.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5">
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {examReadiness.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              + {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {examReadiness.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                          Areas to Improve
                        </p>
                        <ul className="space-y-1">
                          {examReadiness.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              - {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
