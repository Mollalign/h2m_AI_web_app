"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  BookOpen,
  Brain,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { projectsApi } from "@/lib/api/projects";
import { documentsApi } from "@/lib/api/documents";
import { conversationsApi } from "@/lib/api/conversations";
import { quizzesApi } from "@/lib/api/quizzes";
import { topicsApi } from "@/lib/api/topics";
import { knowledgeApi } from "@/lib/api/knowledge";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectDocuments } from "@/components/projects/project-documents";
import { ProjectConversations } from "@/components/projects/project-conversations";
import { ProjectQuizzes } from "@/components/projects/project-quizzes";
import { ProjectKnowledge } from "@/components/projects/project-knowledge";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.get(id),
  });

  const { data: documents } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentsApi.list(id),
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations", { project_id: id }],
    queryFn: () => conversationsApi.list({ project_id: id }),
  });

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => quizzesApi.list(id),
  });

  const { data: topics } = useQuery({
    queryKey: ["topics", id],
    queryFn: () => topicsApi.list(id),
  });

  const { data: knowledge } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => knowledgeApi.getProjectKnowledge(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Button variant="link" onClick={() => router.push("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="size-3.5" />
            Documents
            {documents && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({documents.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-1.5">
            <MessageSquare className="size-3.5" />
            Chats
            {conversations && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({conversations.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-1.5">
            <BookOpen className="size-3.5" />
            Quizzes
            {quizzes && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({quizzes.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5">
            <Brain className="size-3.5" />
            Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview
            project={project}
            documents={documents}
            conversations={conversations}
            quizzes={quizzes}
            topics={topics}
          />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={id} documents={documents} />
        </TabsContent>

        <TabsContent value="conversations">
          <ProjectConversations
            projectId={id}
            conversations={conversations}
          />
        </TabsContent>

        <TabsContent value="quizzes">
          <ProjectQuizzes
            projectId={id}
            quizzes={quizzes}
            topics={topics}
          />
        </TabsContent>

        <TabsContent value="knowledge">
          <ProjectKnowledge
            knowledge={knowledge}
            topics={topics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
