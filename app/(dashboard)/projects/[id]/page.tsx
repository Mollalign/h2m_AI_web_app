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
  FolderKanban,
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
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FolderKanban className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-[15px] font-semibold mb-1">Project not found</h2>
        <Button variant="link" onClick={() => router.push("/projects")} className="text-sm">
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="text-muted-foreground shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FolderKanban className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-[-0.03em] truncate">{project.name}</h1>
          {project.description && (
            <p className="text-[13.5px] text-muted-foreground leading-[1.6] truncate">{project.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1 text-xs data-[state=active]:shadow-sm">
            <FileText className="size-3" />
            Docs
            {documents && (
              <span className="text-[10px] text-muted-foreground">({documents.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-1 text-xs data-[state=active]:shadow-sm">
            <MessageSquare className="size-3" />
            Chats
            {conversations && (
              <span className="text-[10px] text-muted-foreground">({conversations.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-1 text-xs data-[state=active]:shadow-sm">
            <BookOpen className="size-3" />
            Quizzes
            {quizzes && (
              <span className="text-[10px] text-muted-foreground">({quizzes.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1 text-xs data-[state=active]:shadow-sm">
            <Brain className="size-3" />
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
          <ProjectConversations projectId={id} conversations={conversations} />
        </TabsContent>

        <TabsContent value="quizzes">
          <ProjectQuizzes projectId={id} quizzes={quizzes} topics={topics} />
        </TabsContent>

        <TabsContent value="knowledge">
          <ProjectKnowledge knowledge={knowledge} topics={topics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
