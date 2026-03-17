"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FolderKanban,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/types";

function ProjectSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function RecentProjects({
  projects,
  isLoading,
}: {
  projects: Project[] | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Projects
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : !projects?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderKanban className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <Button variant="link" size="sm" asChild className="mt-1">
              <Link href="/projects?new=true">Create your first project</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderKanban className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{project.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      {project.document_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {project.conversation_count ?? 0}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(project.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
