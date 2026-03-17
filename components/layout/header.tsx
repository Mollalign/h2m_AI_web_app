"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length > 1 ? (
              <BreadcrumbLink href={`/${segments[0]}`} className="text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                {currentTitle}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="text-xs font-medium uppercase tracking-wider">
                {currentTitle}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {segments.length > 1 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-semibold capitalize">
                  {segments.slice(1).join(" / ")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
          <Search className="size-4" />
        </Button>

        <Button variant="ghost" size="icon-sm" asChild className="relative text-muted-foreground hover:text-foreground">
          <Link href="/notifications">
            <Bell className="size-4" />
            {unread && unread.count > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            )}
          </Link>
        </Button>
      </div>
    </header>
  );
}
