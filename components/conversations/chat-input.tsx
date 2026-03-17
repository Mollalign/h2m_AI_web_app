"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ChatInput({
  onSend,
  isLoading,
  disabled,
}: {
  onSend: (message: string, imageBase64?: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if ((!trimmed && !imageBase64) || isLoading) return;
    onSend(trimmed || "Analyze this image", imageBase64 || undefined);
    setMessage("");
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;

    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageBase64(null);
  }, [imagePreview]);

  const canSend = (message.trim() || imageBase64) && !isLoading && !disabled;

  return (
    <div className="border-t bg-background/80 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto space-y-2">
        {imagePreview && (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Attached" className="h-16 rounded-xl border object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:bg-foreground/90 transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 transition-colors focus-within:border-primary/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ImagePlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach image</TooltipContent>
          </Tooltip>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageBase64 ? "Describe what you want to know about this image..." : "Ask anything..."}
            disabled={disabled || isLoading}
            className="min-h-[36px] max-h-[160px] resize-none border-0 bg-transparent p-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />

          <Button
            size="icon-sm"
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/60">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
