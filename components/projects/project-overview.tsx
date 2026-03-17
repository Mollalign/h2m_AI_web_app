"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MessageSquare,
  BookOpen,
  Brain,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Conversations",
      value: conversations?.length ?? 0,
      icon: MessageSquare,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Quizzes",
      value: quizzes?.length ?? 0,
      icon: BookOpen,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Topics",
      value: topics?.length ?? 0,
      icon: Brain,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics && topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topics.map((topic) => (
                <div key={topic.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <span className="font-medium">{topic.name}</span>
                    {topic.subtopics?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {topic.subtopics.length} subtopics
                      </Badge>
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground ml-6">
                      {topic.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <Clock className="size-4" />
          Last updated{" "}
          {formatDistanceToNow(new Date(project.updated_at), {
            addSuffix: true,
          })}
        </CardContent>
      </Card>
    </div>
  );
}
