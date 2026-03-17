"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FolderKanban,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/lib/types";

function ProjectSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="size-9 rounded-xl" />
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
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="label-caps">
          Recent Projects
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs h-7 text-muted-foreground hover:text-foreground">
          <Link href="/projects">
            View all
            <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : !projects?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <FolderKanban className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No projects yet</p>
            <p className="text-xs text-muted-foreground mb-3">Create one to get started</p>
            <Button variant="outline" size="sm" asChild className="text-xs h-7">
              <Link href="/projects?new=true">Create project</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center gap-4 py-3 -mx-2 px-2 rounded-xl transition-colors hover:bg-muted/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-transform duration-200 group-hover:scale-105">
                  <FolderKanban className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{project.name}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      {project.document_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {project.conversation_count ?? 0}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
