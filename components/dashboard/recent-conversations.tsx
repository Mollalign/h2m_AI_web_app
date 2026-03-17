"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/lib/types";

function ConvSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="size-9 rounded-xl" />
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
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="label-caps">
          Recent Conversations
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs h-7 text-muted-foreground hover:text-foreground">
          <Link href="/conversations">
            View all
            <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <ConvSkeleton key={i} />
            ))}
          </div>
        ) : !conversations?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No conversations yet</p>
            <p className="text-xs text-muted-foreground mb-3">Start chatting with AI</p>
            <Button variant="outline" size="sm" asChild className="text-xs h-7">
              <Link href="/conversations?new=true">New conversation</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="group flex items-center gap-4 py-3 -mx-2 px-2 rounded-xl transition-colors hover:bg-muted/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/8 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-105">
                  <MessageSquare className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold truncate">{conv.title}</p>
                    {conv.is_socratic && (
                      <Badge variant="secondary" className="shrink-0 gap-0.5 text-[10px] h-5 px-1.5">
                        <Sparkles className="size-2.5" />
                        Socratic
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    {conv.project && (
                      <span className="truncate">{conv.project.name}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
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
