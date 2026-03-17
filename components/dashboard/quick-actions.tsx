"use client";

import Link from "next/link";
import {
  FolderPlus,
  MessageSquarePlus,
  BookOpen,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "New Project",
    description: "Create a learning project",
    href: "/projects?new=true",
    icon: FolderPlus,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "New Chat",
    description: "Start an AI conversation",
    href: "/conversations?new=true",
    icon: MessageSquarePlus,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Take a Quiz",
    description: "Test your knowledge",
    href: "/projects",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Study Plan",
    description: "AI-generated plan",
    href: "/smart-tutor",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-110`}
          >
            <action.icon className="size-5" />
          </div>
          <div>
            <p className="font-medium">{action.title}</p>
            <p className="text-xs text-muted-foreground">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
