"use client";

import { use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Brain, MessageSquare, Eye, GitFork, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sharingApi } from "@/lib/api/sharing";
import { toast } from "sonner";
import type { Message } from "@/lib/types";

function SharedMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="size-8 shrink-0 mt-1">
        <AvatarFallback
          className={
            isUser
              ? "bg-primary text-primary-foreground text-xs"
              : "bg-muted text-muted-foreground text-xs"
          }
        >
          {isUser ? "U" : <Brain className="size-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default function SharedConversationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ["shared", token],
    queryFn: () => sharingApi.viewShared(token),
  });

  const forkMutation = useMutation({
    mutationFn: () => sharingApi.forkShared(token),
    onSuccess: (data) => {
      toast.success("Conversation forked to your account!");
      window.location.href = `/conversations/${data.conversation_id}`;
    },
    onError: () => toast.error("Failed to fork. Please sign in first."),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex gap-3 ${i % 2 ? "" : "flex-row-reverse"}`}>
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Conversation not found
          </h2>
          <p className="text-muted-foreground">
            This shared conversation may have expired or been removed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-6 py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold truncate">{conversation.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="size-3" />
              Shared conversation
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {conversation.messages?.length ?? 0} messages
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => forkMutation.mutate()}
            disabled={forkMutation.isPending}
            className="h-8 text-xs"
          >
            {forkMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <GitFork className="size-3" />
            )}
            Fork
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {conversation.messages?.map((message) => (
          <SharedMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
