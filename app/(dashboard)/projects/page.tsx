"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  MessageSquare,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { projectsApi } from "@/lib/api/projects";
import type { Project } from "@/lib/types";

function ProjectCard({ project }: { project: Project }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      projectsApi.update(project.id, { is_archived: !project.is_archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(project.is_archived ? "Project unarchived" : "Project archived");
    },
  });

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
            <FolderKanban className="size-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Pencil className="size-4" />
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => archiveMutation.mutate()}>
                <Archive className="size-4" />
                {project.is_archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/projects/${project.id}`} className="block group/link">
          <h3 className="font-semibold text-[13px] truncate mb-1 group-hover/link:text-primary transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-[1.6]">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              {project.document_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" />
              {project.conversation_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" />
              {project.quiz_count ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </span>
            {project.is_archived ? (
              <Badge variant="secondary" className="text-[10px] h-5">Archived</Badge>
            ) : (
              <ArrowRight className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200" />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="size-11 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-full mb-4" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(
    searchParams.get("new") === "true"
  );

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", { limit: 50 }],
    queryFn: () => projectsApi.list({ limit: 50 }),
  });

  const filtered = search
    ? projects?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em]">Projects</h1>
          <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">
            Organize your learning materials by subject
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="h-9 text-sm font-semibold">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderKanban className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1">
            {search ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-sm text-muted-foreground leading-[1.6] mb-4 max-w-xs">
            {search
              ? "Try a different search term"
              : "Create your first project to start organizing your learning"}
          </p>
          {!search && (
            <Button onClick={() => setShowCreate(true)} variant="outline" className="h-9 text-sm font-semibold">
              <Plus className="size-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
