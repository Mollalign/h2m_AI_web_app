"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MessageSquare,
  BookOpen,
  Brain,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project, Document, Conversation, Quiz, Topic } from "@/lib/types";

export function ProjectOverview({
  project,
  documents,
  conversations,
  quizzes,
  topics,
}: {
  project: Project;
  documents: Document[] | undefined;
  conversations: Conversation[] | undefined;
  quizzes: Quiz[] | undefined;
  topics: Topic[] | undefined;
}) {
  const stats = [
    {
      label: "Documents",
      value: documents?.length ?? 0,
      icon: FileText,
      iconColor: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Conversations",
      value: conversations?.length ?? 0,
      icon: MessageSquare,
      iconColor: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Quizzes",
      value: quizzes?.length ?? 0,
      icon: BookOpen,
      iconColor: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Topics",
      value: topics?.length ?? 0,
      icon: Brain,
      iconColor: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg} transition-transform duration-200 group-hover:scale-105`}>
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="label-caps">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {topics && topics.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-5 pb-4">
            <Brain className="size-4 text-primary" />
            <h2 className="text-[13px] font-semibold">Topics</h2>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {topics.map((topic) => (
              <div key={topic.id} className="rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <Brain className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium text-sm">{topic.name}</span>
                  {topic.subtopics?.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {topic.subtopics.length} subtopics
                    </Badge>
                  )}
                </div>
                {topic.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 ml-5.5 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
        <Clock className="size-3" />
        Last updated{" "}
        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
}
