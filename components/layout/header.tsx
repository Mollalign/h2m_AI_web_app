"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { notificationsApi } from "@/lib/api/notifications";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/conversations": "Conversations",
  "/progress": "Progress",
  "/smart-tutor": "Smart Tutor",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });

  const segments = pathname.split("/").filter(Boolean);
  const currentTitle = pageTitles[`/${segments[0]}`] || segments[0];

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length > 1 ? (
              <BreadcrumbLink href={`/${segments[0]}`}>
                {currentTitle}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {segments.length > 1 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {segments.slice(1).join(" / ")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        {pathname === "/projects" && (
          <Button size="sm" asChild>
            <Link href="/projects?new=true">
              <Plus className="size-4" />
              New Project
            </Link>
          </Button>
        )}

        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/notifications">
            <Bell className="size-4" />
            {unread && unread.count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]"
              >
                {unread.count > 9 ? "9+" : unread.count}
              </Badge>
            )}
          </Link>
        </Button>
      </div>
    </header>
  );
}
