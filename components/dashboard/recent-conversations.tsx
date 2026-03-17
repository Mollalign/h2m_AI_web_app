"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/lib/types";

function ConvSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export function RecentConversations({
  conversations,
  isLoading,
}: {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Conversations
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/conversations">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <ConvSkeleton key={i} />
            ))}
          </div>
        ) : !conversations?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <Button variant="link" size="sm" asChild className="mt-1">
              <Link href="/conversations?new=true">
                Start your first conversation
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <MessageSquare className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{conv.title}</p>
                    {conv.is_socratic && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 gap-1 text-xs"
                      >
                        <Sparkles className="size-3" />
                        Socratic
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {conv.project && (
                      <span className="truncate">{conv.project.name}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(conv.updated_at), {
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
