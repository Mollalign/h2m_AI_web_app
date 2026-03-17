"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { conversationsApi } from "@/lib/api/conversations";
import { projectsApi } from "@/lib/api/projects";

function ConversationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(searchParams.get("new") === "true");
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState<string>("");
  const [isSocratic, setIsSocratic] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationsApi.list(),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", { limit: 100 }],
    queryFn: () => projectsApi.list({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      conversationsApi.create({
        title: newTitle || "New conversation",
        project_id: newProjectId || undefined,
        is_socratic: isSocratic,
      }),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowCreate(false);
      setNewTitle("");
      setNewProjectId("");
      router.push(`/conversations/${conv.id}`);
    },
    onError: () => toast.error("Failed to create conversation"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation deleted");
    },
  });

  const filtered = conversations?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em]">Conversations</h1>
          <p className="text-[13.5px] text-muted-foreground leading-[1.6] mt-1">
            Chat with AI about your learning materials
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="h-9 text-sm font-semibold">
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1">
            {search ? "No conversations found" : "No conversations yet"}
          </h3>
          <p className="text-sm text-muted-foreground leading-[1.6] mb-4 max-w-xs">
            {search ? "Try a different search term" : "Start a conversation with AI to learn"}
          </p>
          {!search && (
            <Button onClick={() => setShowCreate(true)} variant="outline" className="h-9 text-sm font-semibold">
              <Plus className="size-4" />
              New Chat
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:border-border/80"
            >
              <Link
                href={`/conversations/${conv.id}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-105">
                  <MessageSquare className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    {conv.is_socratic && (
                      <Badge variant="secondary" className="gap-0.5 text-[10px] h-5 px-1.5 shrink-0">
                        <Sparkles className="size-2.5" />
                        Socratic
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    {conv.project && (
                      <span className="truncate">{conv.project.name}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200 shrink-0" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => deleteMutation.mutate(conv.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="size-4 text-primary" />
              </div>
              New Conversation
            </DialogTitle>
            <DialogDescription>
              Start a new chat with your AI tutor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="label-caps">Title (optional)</Label>
              <Input
                placeholder="What would you like to learn?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="label-caps">Project (optional)</Label>
              <Select value={newProjectId} onValueChange={setNewProjectId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="No project (quick chat)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <Label className="text-sm font-medium">Socratic mode</Label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 ml-5">
                  AI guides you with questions instead of direct answers
                </p>
              </div>
              <Switch checked={isSocratic} onCheckedChange={setIsSocratic} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="h-9 text-sm font-semibold">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="h-9 text-sm font-semibold"
              >
                {createMutation.isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <MessageSquare className="size-4" />
                )}
                Start Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <ConversationsContent />
    </Suspense>
  );
}
