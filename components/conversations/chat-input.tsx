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
    <div className="bg-background px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-2 sm:pb-4">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {imagePreview && (
          <div className="relative inline-block mb-3 self-start w-full">
            <img src={imagePreview} alt="Attached" className="h-16 rounded-xl border object-cover shadow-sm" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:bg-foreground/90 transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <div className="flex w-full items-end gap-2 rounded-[28px] border border-border/80 bg-muted/40 px-2 py-2 shadow-sm transition-all focus-within:bg-background focus-within:border-primary/40 focus-within:shadow-md focus-within:ring-4 focus-within:ring-primary/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="size-[38px] shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 ml-0.5 mb-0.5"
              >
                <ImagePlus className="size-[1.15rem]" />
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
            className="min-h-[40px] max-h-[180px] resize-none border-0 bg-transparent px-2 py-[10px] text-[14.5px] leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            rows={1}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            className={`size-[38px] shrink-0 rounded-full transition-all mb-0.5 mr-0.5 ${
              canSend ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105" : "bg-muted-foreground/20 text-muted-foreground"
            }`}
          >
            {isLoading ? (
              <Loader2 className="size-[1.15rem] animate-spin" />
            ) : (
              <Send className="size-[1.15rem] ml-0.5" />
            )}
          </Button>
        </div>

        <p className="text-[10px] sm:text-[11px] text-muted-foreground/40 font-medium tracking-wide mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
