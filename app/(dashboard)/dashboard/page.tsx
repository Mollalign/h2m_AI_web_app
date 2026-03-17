"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { knowledgeApi } from "@/lib/api/knowledge";
import { projectsApi } from "@/lib/api/projects";
import { conversationsApi } from "@/lib/api/conversations";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WelcomeCard } from "@/components/dashboard/welcome-card";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: knowledgeApi.getProgressStats,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", { limit: 6 }],
    queryFn: () => projectsApi.list({ limit: 6 }),
  });

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations", { limit: 5 }],
    queryFn: () => conversationsApi.list({ limit: 5 }),
  });

  return (
    <div className="space-y-6">
      <WelcomeCard user={user} />
      <DashboardStats stats={stats} isLoading={statsLoading} />
      <QuickActions />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects projects={projects} isLoading={projectsLoading} />
        <RecentConversations conversations={conversations} isLoading={convsLoading} />
      </div>
    </div>
  );
}
