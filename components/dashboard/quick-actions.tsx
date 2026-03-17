"use client";

import Link from "next/link";
import {
  FolderPlus,
  MessageSquarePlus,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    title: "New Project",
    description: "Organize your learning materials",
    href: "/projects?new=true",
    icon: FolderPlus,
    color: "text-primary bg-primary/10 group-hover:bg-primary/15",
  },
  {
    title: "Start Chat",
    description: "Talk to your AI tutor",
    href: "/conversations?new=true",
    icon: MessageSquarePlus,
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/15",
  },
  {
    title: "Take Quiz",
    description: "Test your knowledge",
    href: "/projects",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/15",
  },
  {
    title: "Study Plan",
    description: "AI-generated learning path",
    href: "/smart-tutor",
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/15",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5"
        >
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${action.color}`}>
            <action.icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13px]">{action.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {action.description}
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
        </Link>
      ))}
    </div>
  );
}
