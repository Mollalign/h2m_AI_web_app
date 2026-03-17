"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { conversationsApi } from "@/lib/api/conversations";
import type { Conversation } from "@/lib/types";

export function ProjectConversations({
  projectId,
  conversations,
}: {
  projectId: string;
  conversations: Conversation[] | undefined;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      conversationsApi.create({
        project_id: projectId,
        title: "New conversation",
      }),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/conversations/${conv.id}`);
    },
    onError: () => toast.error("Failed to create conversation"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => createMutation.mutate()}>
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      {!conversations?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="size-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No conversations yet</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => createMutation.mutate()}
          >
            Start chatting with AI
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="transition-all hover:border-primary/30"
            >
              <CardContent className="p-4">
                <Link
                  href={`/conversations/${conv.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <MessageSquare className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{conv.title}</p>
                      {conv.is_socratic && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Sparkles className="size-3" />
                          Socratic
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(conv.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
