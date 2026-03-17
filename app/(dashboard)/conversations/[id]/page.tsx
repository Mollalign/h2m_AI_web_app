"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "@/components/conversations/chat-message";
import { ChatInput } from "@/components/conversations/chat-input";
import { conversationsApi } from "@/lib/api/conversations";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Message } from "@/lib/types";

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversations", id],
    queryFn: () => conversationsApi.get(id),
  });

  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingContent, scrollToBottom]);

  const handleSendMessage = useCallback(
    (content: string, imageBase64?: string) => {
      setIsStreaming(true);
      setStreamingContent("");

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: id,
        role: "user",
        content,
        sources: null,
        tokens_used: null,
        attachments: imageBase64 ? ["image"] : null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["conversations", id],
        (old: typeof conversation) => {
          if (!old) return old;
          return { ...old, messages: [...old.messages, userMessage] };
        }
      );

      const controller = conversationsApi.streamMessage(
        id,
        content,
        () => {},
        (chunk: string) => {
          setStreamingContent((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          setStreamingContent("");
          queryClient.invalidateQueries({ queryKey: ["conversations", id] });
        },
        (error: string) => {
          setIsStreaming(false);
          setStreamingContent("");
          console.error("Stream error:", error);
          queryClient.invalidateQueries({ queryKey: ["conversations", id] });
        },
        imageBase64
      );

      abortRef.current = controller;
    },
    [id, queryClient, conversation]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <div className="flex items-center gap-3 p-4 border-b">
          <Skeleton className="size-8" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 ? "" : "flex-row-reverse"}`}>
              <Skeleton className="size-7 rounded-full shrink-0" />
              <Skeleton className="h-14 w-60 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Brain className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-[15px] font-semibold mb-1">Conversation not found</h2>
        <Button variant="link" onClick={() => router.push("/conversations")} className="text-sm">
          Back to conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-4 lg:-m-6">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b bg-background/80 backdrop-blur-xl">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold truncate">{conversation.title}</h2>
            {conversation.is_socratic && (
              <Badge variant="secondary" className="gap-0.5 text-[10px] h-5 px-1.5 shrink-0">
                <Sparkles className="size-2.5" />
                Socratic
              </Badge>
            )}
          </div>
          {conversation.project && (
            <p className="text-[11px] text-muted-foreground truncate">
              {conversation.project.name}
            </p>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-5">
          {conversation.messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="size-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">
                Start the conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-[1.65]">
                {conversation.project
                  ? "Ask me anything about your uploaded documents"
                  : "Ask me anything about informatics"}
              </p>
            </div>
          )}

          {conversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} userInitials={userInitials} />
          ))}

          {isStreaming && streamingContent && (
            <ChatMessage
              message={{
                id: "streaming",
                conversation_id: id,
                role: "assistant",
                content: streamingContent,
                sources: null,
                tokens_used: null,
                attachments: null,
                created_at: new Date().toISOString(),
              }}
              userInitials={userInitials}
            />
          )}

          {isStreaming && !streamingContent && (
            <div className="flex gap-3">
              <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Brain className="size-3.5 text-muted-foreground" />
              </div>
              <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-lg px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInput
        onSend={(msg, img) => handleSendMessage(msg, img)}
        isLoading={isStreaming}
      />
    </div>
  );
}
