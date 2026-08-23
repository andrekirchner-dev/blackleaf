"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getComments, addComment, deleteComment, getUserProfileData } from "@/lib/community";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CommunityComment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function safeDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  return new Date(val as string);
}

interface CommentSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded: () => void;
}

export function CommentSheet({
  open,
  onClose,
  postId,
  onCommentAdded,
}: CommentSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [userHandle, setUserHandle] = useState<string>("grower");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    Promise.all([
      getComments(postId),
      getUserProfileData(user.uid),
    ])
      .then(([fetchedComments, profile]) => {
        setComments(fetchedComments);
        if (profile?.handle) setUserHandle(profile.handle);
        if (profile?.avatarUrl) setUserAvatarUrl(profile.avatarUrl);
      })
      .finally(() => setLoading(false));
  }, [open, postId, user]);

  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  async function handleSend() {
    if (!user || !text.trim() || sending) return;
    setSending(true);
    try {
      await addComment(user.uid, postId, text, userHandle, userAvatarUrl);
      setText("");
      const updated = await getComments(postId);
      setComments(updated);
      onCommentAdded();
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return;
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silently fail
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-card border-border h-[80vh] flex flex-col p-0"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2">
            Comentários
            {comments.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                {comments.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a comentar
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwn = comment.userId === user?.uid;
              const initials = comment.handle.slice(-2).toUpperCase();
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {comment.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comment.avatarUrl}
                        alt={comment.handle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-primary">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        @{comment.handle}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(safeDate(comment.createdAt), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>

                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 rounded text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-border flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicione um comentário..."
            className={cn(
              "flex-1 bg-background border-border",
              "h-9 text-sm"
            )}
            disabled={sending}
          />
          <Button
            type="button"
            size="icon-sm"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
