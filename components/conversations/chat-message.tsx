"use client";

import { Brain, User, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/lib/types";

export function ChatMessage({
  message,
  userInitials,
}: {
  message: Message;
  userInitials: string;
}) {
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
          {isUser ? userInitials : <Brain className="size-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col gap-1.5 max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <Badge
                key={i}
                variant="outline"
                className="gap-1 text-xs font-normal"
              >
                <FileText className="size-3" />
                {source.document_name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
