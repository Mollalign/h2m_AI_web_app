"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Share2,
  Link2,
  Trash2,
  Eye,
  ExternalLink,
  Globe,
  Lock,
  Copy,
  MoreHorizontal,
  Inbox,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sharingApi } from "@/lib/api/sharing";
import type { ConversationDetail } from "@/lib/types";

export default function SharesPage() {
  const queryClient = useQueryClient();
  const [viewToken, setViewToken] = useState("");
  const [showBrowse, setShowBrowse] = useState(false);

  const { data: shares, isLoading } = useQuery({
    queryKey: ["shares"],
    queryFn: sharingApi.listShares,
  });

  const { data: sharedWithMe, isLoading: sharedWithMeLoading } = useQuery({
    queryKey: ["shared-with-me"],
    queryFn: sharingApi.getSharedWithMe,
  });

  const deleteMutation = useMutation({
    mutationFn: (shareId: string) => sharingApi.deleteShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares"] });
      toast.success("Share link removed");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      sharingApi.updateShare(id, { is_active: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares"] });
      toast.success("Share updated");
    },
  });

  const forkMutation = useMutation({
    mutationFn: (token: string) => sharingApi.forkShared(token),
    onSuccess: (data) => {
      toast.success("Conversation forked to your account");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      window.location.href = `/conversations/${data.conversation_id}`;
    },
    onError: () => toast.error("Failed to fork conversation"),
  });

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleBrowse = () => {
    if (viewToken.trim()) {
      window.open(`/shared/${viewToken.trim()}`, "_blank");
      setShowBrowse(false);
      setViewToken("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] flex items-center gap-2">
            <Share2 className="size-5 text-primary" />
            Shared
          </h1>
          <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">
            Manage your shared conversations and view conversations shared with you
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowBrowse(true)} className="h-9 text-sm font-semibold">
          <Link2 className="size-4" />
          Browse by Code
        </Button>
      </div>

      <Tabs defaultValue="my-shares">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="my-shares" className="text-xs data-[state=active]:shadow-sm">
            My Shared Links
            {shares && shares.length > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1">({shares.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="shared-with-me" className="text-xs data-[state=active]:shadow-sm">
            Shared with Me
            {sharedWithMe && sharedWithMe.length > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1">({sharedWithMe.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-shares" className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : !shares?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Share2 className="size-7 text-muted-foreground" />
              </div>
              <h3 className="text-[15px] font-semibold mb-1">No shared links</h3>
              <p className="text-sm text-muted-foreground leading-[1.6] max-w-xs">
                Share a conversation from the chat page to create a public link
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {share.share_type === "public" ? (
                      <Globe className="size-5" />
                    ) : (
                      <Lock className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{share.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] h-4 px-1.5 ${
                          share.is_active
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {share.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {share.view_count} views
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => copyShareLink(share.share_token)}
                      title="Copy link"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => window.open(`/shared/${share.share_token}`, "_blank")}
                      title="Open"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            toggleMutation.mutate({ id: share.id, active: !share.is_active })
                          }
                        >
                          {share.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(share.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared-with-me" className="mt-4">
          {sharedWithMeLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : !sharedWithMe?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Inbox className="size-7 text-muted-foreground" />
              </div>
              <h3 className="text-[15px] font-semibold mb-1">Nothing shared with you</h3>
              <p className="text-sm text-muted-foreground leading-[1.6] max-w-xs">
                When someone shares a conversation with you, it will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(sharedWithMe as ConversationDetail[]).map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <MessageSquare className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {conv.messages?.length ?? 0} messages
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => window.location.href = `/conversations/${conv.id}`}
                  >
                    <ExternalLink className="size-3" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showBrowse} onOpenChange={setShowBrowse}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Browse Shared Conversation</DialogTitle>
            <DialogDescription>Enter a share code to view a shared conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Code</Label>
              <Input
                placeholder="Paste share code or token..."
                value={viewToken}
                onChange={(e) => setViewToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBrowse()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBrowse(false)}>
                Cancel
              </Button>
              <Button onClick={handleBrowse} disabled={!viewToken.trim()}>
                <ExternalLink className="size-4" />
                View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
