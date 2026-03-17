"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Brain,
  BookOpen,
  Target,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { smartTutorApi } from "@/lib/api/smart-tutor";
import { projectsApi } from "@/lib/api/projects";
import type { StudyPlan, StudyPlanDay } from "@/lib/types";

function StudyPlanContent({ plan: studyPlan }: { plan: StudyPlan }) {
  const planData = studyPlan.plan;

  const getDays = (): StudyPlanDay[] => {
    if (Array.isArray(planData)) return planData;
    if (typeof planData === "object" && planData !== null && "days" in planData) {
      return Array.isArray((planData as { days: StudyPlanDay[] }).days)
        ? (planData as { days: StudyPlanDay[] }).days
        : [];
    }
    return [];
  };

  const getSummary = (): string | null => {
    if (typeof planData === "string") return planData;
    if (typeof planData === "object" && planData !== null && "summary" in planData) {
      return (planData as { summary?: string }).summary || null;
    }
    return null;
  };

  const days = getDays();
  const summary = getSummary();

  return (
    <div className="space-y-4">
      {summary && (
        <p className="text-sm whitespace-pre-wrap leading-[1.6]">{summary}</p>
      )}

      {days.length > 0 && (
        <div className="space-y-2">
          {days.map((day, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-primary">
                  {day.day ? `Day ${day.day}` : day.date ? day.date : `Step ${i + 1}`}
                </span>
                {day.hours && (
                  <span className="text-[10px] text-muted-foreground">{day.hours}h</span>
                )}
              </div>
              {day.focus && (
                <p className="text-[13px] font-semibold mb-1">{day.focus}</p>
              )}
              {day.topics && day.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {day.topics.map((topic, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px] h-5 px-2">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
              {day.activities && day.activities.length > 0 && (
                <ul className="space-y-0.5">
                  {day.activities.map((activity, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5 shrink-0">-</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {!days.length && !summary && (
        <p className="text-sm text-muted-foreground leading-[1.6]">
          {typeof planData === "object" ? JSON.stringify(planData, null, 2) : String(planData)}
        </p>
      )}

      {studyPlan.topic_mastery?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {studyPlan.topic_mastery.map((t, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] h-5 px-2">
              {t.name} ({Math.round(t.mastery * 100)}%)
            </Badge>
          ))}
        </div>
      )}

      {studyPlan.days_until_exam > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {studyPlan.days_until_exam} days until exam &middot; {studyPlan.daily_hours}h/day
        </p>
      )}
    </div>
  );
}

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
    queryKey: ["projects", { limit: 10 }],
    queryFn: () => projectsApi.list({ limit: 10 }),
  });

  const firstProjectId = projects?.[0]?.id;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Smart Tutor
        </h1>
        <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">
          AI-powered insights and personalized learning recommendations
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-5 pb-4">
            <Lightbulb className="size-4 text-amber-500" />
            <h2 className="text-[13px] font-semibold">Topic Suggestions</h2>
          </div>
          <div className="px-5 pb-5">
            {suggestionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : !suggestions?.length ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Brain className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-[1.6]">
                  Take some quizzes first to get personalized suggestions
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover:scale-105">
                      <Target className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.topic}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-[1.6]">
                        {s.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-5 pb-4">
            <Brain className="size-4 text-purple-500" />
            <h2 className="text-[13px] font-semibold">Learning Style</h2>
          </div>
          <div className="px-5 pb-5">
            {styleLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : !learningStyle ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Brain className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-[1.6]">
                  Interact more with the AI to detect your learning style
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge className="text-xs">{learningStyle.style}</Badge>
                <p className="text-sm text-muted-foreground leading-[1.6]">
                  {learningStyle.description}
                </p>
                {learningStyle.recommendations?.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="label-caps">
                      Recommendations
                    </p>
                    <ul className="space-y-2">
                      {learningStyle.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm leading-[1.6]">
                          <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {firstProjectId && (
          <>
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-5 pb-4">
                <BookOpen className="size-4 text-primary" />
                <h2 className="text-[13px] font-semibold">Study Plan</h2>
              </div>
              <div className="px-5 pb-5">
                {planLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : !studyPlan ? (
                  <p className="text-sm text-muted-foreground leading-[1.6]">
                    Upload documents and take quizzes to get a study plan
                  </p>
                ) : (
                  <StudyPlanContent plan={studyPlan} />
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-5 pb-4">
                <Target className="size-4 text-green-500" />
                <h2 className="text-[13px] font-semibold">Exam Readiness</h2>
              </div>
              <div className="px-5 pb-5">
                {readinessLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : !examReadiness ? (
                  <p className="text-sm text-muted-foreground leading-[1.6]">
                    Take quizzes to see your exam readiness
                  </p>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="label-caps">
                          Readiness Score
                        </span>
                        <span className="text-lg font-bold">
                          {(examReadiness.readiness_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={examReadiness.readiness_score * 100} className="h-2" />
                    </div>

                    {examReadiness.strengths?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                          Strengths
                        </p>
                        <ul className="space-y-1.5">
                          {examReadiness.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 shrink-0 mt-0.5">+</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {examReadiness.weaknesses?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Areas to Improve
                        </p>
                        <ul className="space-y-1.5">
                          {examReadiness.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500 shrink-0 mt-0.5">-</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
