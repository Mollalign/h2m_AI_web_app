"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, FileText, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import type { Message } from "@/lib/types";

function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"code"> & { inline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isBlock = !props.inline && match;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  if (isBlock) {
    return (
      <div className="group/code relative my-3 rounded-xl overflow-hidden border border-border/50">
        <div className="flex items-center justify-between bg-muted/80 px-4 py-2 text-[11px]">
          <span className="font-mono text-muted-foreground uppercase tracking-wider">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="overflow-x-auto bg-zinc-950 dark:bg-zinc-900 p-4 text-[13px] leading-relaxed text-zinc-100">
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-foreground" {...props}>
      {children}
    </code>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-lg font-bold tracking-[-0.02em] mt-4 mb-2 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold tracking-[-0.015em] mt-4 mb-2 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h3>,
        h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h4>,
        p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-[1.65]">{children}</p>,
        ul: ({ children }) => <ul className="mb-2.5 ml-4 list-disc space-y-1 last:mb-0 marker:text-muted-foreground">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2.5 ml-4 list-decimal space-y-1 last:mb-0 marker:text-muted-foreground">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors">
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        th: ({ children }) => <th className="px-3 py-2 text-left label-caps">{children}</th>,
        td: ({ children }) => <td className="border-t border-border/50 px-3 py-2">{children}</td>,
        hr: () => <hr className="my-4 border-border/50" />,
        code: CodeBlock as never,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

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
      <Avatar className="size-7 shrink-0 mt-1">
        <AvatarFallback
          className={`text-[10px] font-medium ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isUser ? userInitials : <Brain className="size-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1.5 ${isUser ? "items-end max-w-[70%]" : "items-start max-w-[85%]"}`}>
        <div
          className={`rounded-2xl text-[13px] leading-[1.65] ${
            isUser
              ? "bg-primary text-primary-foreground px-4 py-2.5 rounded-br-lg"
              : "bg-muted/60 border border-border/40 px-4 py-3 rounded-bl-lg"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <div className="break-words">
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-[10px] font-normal h-5 px-1.5 border-border/50">
                <FileText className="size-2.5" />
                {source.document_name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
