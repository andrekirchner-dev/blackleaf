"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Trash2, Flag, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  deleteCommunityPost,
} from "@/lib/community";
import { reportPost } from "@/lib/reports";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CommunityPost } from "@/lib/community";
import Link from "next/link";
import { STAGE_LABELS, STAGE_COLORS, MEDIUM_LABELS } from "@/lib/constants";
import { MapPin, Zap } from "lucide-react";
import { CommentSheet } from "./comment-sheet";

const LIGHT_LABELS: Record<string, string> = {
  led: "LED",
  hps: "HPS",
  cmh: "CMH",
  cfl: "CFL",
  fluorescente: "Fluorescente",
  natural: "Natural",
};

const REPORT_REASONS = [
  "Conteúdo inapropriado",
  "Spam",
  "Conteúdo enganoso",
  "Menor de idade",
];

function safeDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  return new Date(val as string);
}

function renderCaption(text: string) {
  const parts = text.split(/(@\w+|#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-primary font-medium">
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      return (
        <span key={i} className="text-green-400 font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface PostCardProps {
  post: CommunityPost;
  isLiked: boolean;
  isSaved: boolean;
  onLikeToggle: (postId: string, nowLiked: boolean) => void;
  onSaveToggle: (postId: string, nowSaved: boolean) => void;
  onDeleted: (postId: string) => void;
}

export function PostCard({
  post,
  isLiked,
  isSaved,
  onLikeToggle,
  onSaveToggle,
  onDeleted,
}: PostCardProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === post.userId;

  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount ?? 0);
  const [localSaved, setLocalSaved] = useState(isSaved);

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const [commentOpen, setCommentOpen] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount ?? 0);

  const initials = post.handle.slice(-2).toUpperCase();
  const ago = formatDistanceToNow(safeDate(post.createdAt), {
    locale: ptBR,
    addSuffix: true,
  });

  async function handleLike() {
    if (!user) return;
    const nowLiked = !localLiked;
    setLocalLiked(nowLiked);
    setLocalLikesCount((c) => c + (nowLiked ? 1 : -1));
    onLikeToggle(post.id, nowLiked);
    try {
      if (nowLiked) {
        await likePost(user.uid, post.id);
      } else {
        await unlikePost(user.uid, post.id);
      }
    } catch {
      setLocalLiked(!nowLiked);
      setLocalLikesCount((c) => c + (nowLiked ? -1 : 1));
      onLikeToggle(post.id, !nowLiked);
    }
  }

  async function handleSave() {
    if (!user) return;
    const nowSaved = !localSaved;
    setLocalSaved(nowSaved);
    onSaveToggle(post.id, nowSaved);
    try {
      if (nowSaved) {
        await savePost(user.uid, post.id, post.photoUrl);
      } else {
        await unsavePost(user.uid, post.id);
      }
    } catch {
      setLocalSaved(!nowSaved);
      onSaveToggle(post.id, !nowSaved);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Excluir este post permanentemente?")) return;
    try {
      await deleteCommunityPost(post.id);
      onDeleted(post.id);
    } catch {
      // silently fail
    }
  }

  async function handleReport(reason: string) {
    if (!user) return;
    setReportMenuOpen(false);
    setMenuOpen(false);
    try {
      await reportPost(user.uid, post.handle, post.id, post.photoUrl, reason);
      setReportSent(true);
      setTimeout(() => setReportSent(false), 2000);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/community/${post.userId}`}>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 hover:border-primary/50 transition-colors overflow-hidden">
            {post.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.avatarUrl}
                alt={post.handle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-primary">{initials}</span>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/community/${post.userId}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            @{post.handle}
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {post.weekOfGrow && <span>S{post.weekOfGrow}</span>}
            {post.weekOfGrow && <span>·</span>}
            <span>{ago}</span>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((o) => !o);
              setReportMenuOpen(false);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[160px] bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setReportMenuOpen(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <Flag size={14} />
                Denunciar
              </button>
            </div>
          )}

          {reportMenuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[200px] bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                Motivo da denúncia
              </p>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleReport(reason)}
                  className="flex w-full items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted/40 transition-colors"
                >
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReportMenuOpen(false)}
                className="flex w-full items-center px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted/40 transition-colors border-t border-border"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo */}
      <div className="w-full aspect-video bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.photoUrl}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors",
            localLiked
              ? "text-red-500 hover:text-red-400"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart
            size={18}
            className={cn("transition-all", localLiked && "fill-red-500")}
          />
          <span className="text-xs">{localLikesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommentOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-xs">{localCommentsCount}</span>
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            localSaved
              ? "text-primary hover:text-primary/70"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Bookmark
            size={18}
            className={cn("transition-all", localSaved && "fill-primary")}
          />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 space-y-2.5">
        {reportSent && (
          <p className="text-xs text-green-400 font-medium">Denúncia enviada</p>
        )}

        <p className="text-sm text-foreground/90 leading-relaxed">
          {renderCaption(post.caption)}
        </p>

        {(post.plantSnapshots.length > 0 || post.medium || post.lightType) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.plantSnapshots.map((snap) => (
              <span
                key={snap.id}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  STAGE_COLORS[snap.stage as keyof typeof STAGE_COLORS] ??
                    "bg-muted/20 text-muted-foreground border-border"
                )}
              >
                {snap.name}
                <span className="opacity-60">
                  · {STAGE_LABELS[snap.stage as keyof typeof STAGE_LABELS] ?? snap.stage}
                </span>
              </span>
            ))}
            {post.medium && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <MapPin size={9} />
                {MEDIUM_LABELS[post.medium as keyof typeof MEDIUM_LABELS] ?? post.medium}
              </span>
            )}
            {post.lightType && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                <Zap size={9} />
                {LIGHT_LABELS[post.lightType] ?? post.lightType}
              </span>
            )}
          </div>
        )}

        {post.weekOfGrow && (
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-400">
            Semana {post.weekOfGrow}
          </span>
        )}
      </div>

      <CommentSheet
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        postId={post.id}
        onCommentAdded={() => setLocalCommentsCount((c) => c + 1)}
      />
    </div>
  );
}
