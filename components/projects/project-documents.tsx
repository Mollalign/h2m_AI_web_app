"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Upload,
  FileText,
  FileType,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentsApi } from "@/lib/api/documents";
import type { Document, DocumentStatus } from "@/lib/types";

const statusConfig: Record<
  DocumentStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    color: "text-green-600 bg-green-500/10",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "text-blue-600 bg-blue-500/10",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-amber-600 bg-amber-500/10",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    color: "text-red-600 bg-red-500/10",
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function ProjectDocuments({
  projectId,
  documents,
}: {
  projectId: string;
  documents: Document[] | undefined;
}) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document uploaded!");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response
          ?.data?.detail || "Upload failed";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.delete(projectId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document deleted");
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.reprocess(projectId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Document queued for reprocessing");
    },
  });

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => uploadMutation.mutate(file));
    },
    [uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <Upload className="size-8 text-muted-foreground mb-3" />
        <p className="font-medium mb-1">Drop files here or click to upload</p>
        <p className="text-sm text-muted-foreground">
          Supports PDF, DOCX, PPTX, TXT (max 50MB)
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {uploadMutation.isPending && (
          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {!documents?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="size-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const status = statusConfig[doc.status];
            const StatusIcon = status.icon;
            return (
              <Card key={doc.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FileType className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {doc.original_filename}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>&middot;</span>
                      <span className="uppercase">{doc.file_type}</span>
                      {doc.chunk_count > 0 && (
                        <>
                          <span>&middot;</span>
                          <span>{doc.chunk_count} chunks</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`gap-1 ${status.color}`}
                  >
                    <StatusIcon
                      className={`size-3 ${
                        doc.status === "processing" ? "animate-spin" : ""
                      }`}
                    />
                    {status.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {doc.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => reprocessMutation.mutate(doc.id)}
                        title="Reprocess"
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
