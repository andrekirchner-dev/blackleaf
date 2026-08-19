"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getCommunityPosts, makeHandle } from "@/lib/community";
import { usePlants } from "@/hooks/use-plants";
import type { CommunityPost } from "@/lib/community";
import { PostForm } from "@/components/community/post-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STAGE_LABELS, STAGE_COLORS, MEDIUM_LABELS } from "@/lib/constants";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Users, Plus, Loader2, ImageOff, MapPin, Zap, CalendarDays } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const LIGHT_LABELS: Record<string, string> = {
  led: "LED", hps: "HPS", cmh: "CMH",
  cfl: "CFL", fluorescente: "Fluorescente", natural: "Natural",
};

function safeDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "object" && "toDate" in (val as object)) {
    return (val as { toDate: () => Date }).toDate();
  }
  return new Date(val as string);
}

function PostCard({ post, currentUserId }: { post: CommunityPost; currentUserId: string }) {
  const isMe = post.userId === currentUserId;
  const ago = formatDistanceToNow(safeDate(post.createdAt), { locale: ptBR, addSuffix: true });
  const handle = isMe ? "Você" : post.handle;
  const initials = post.handle.slice(-2).toUpperCase();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/community/${post.userId}`}>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 hover:border-primary/50 transition-colors">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/community/${post.userId}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {handle}
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {post.weekOfGrow && <span>S{post.weekOfGrow}</span>}
            {post.weekOfGrow && <span>·</span>}
            <span>{ago}</span>
          </div>
        </div>
        {isMe && (
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium shrink-0">
            Você
          </span>
        )}
      </div>

      {/* Photo */}
      <div className="w-full aspect-square bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.photoUrl}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Caption */}
        <p className="text-sm text-foreground/90 leading-relaxed">{post.caption}</p>

        {/* Tags */}
        {(post.plantSnapshots.length > 0 || post.medium || post.lightType) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.plantSnapshots.map((snap) => (
              <span
                key={snap.id}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  STAGE_COLORS[snap.stage as keyof typeof STAGE_COLORS] ?? "bg-muted/20 text-muted-foreground border-border"
                )}
              >
                🌿 {snap.name}
                <span className="opacity-60">· {STAGE_LABELS[snap.stage as keyof typeof STAGE_LABELS] ?? snap.stage}</span>
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
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { plants } = usePlants();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <MotionPage>
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Header */}
        <MotionItem>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Comunidade</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user && (
                    <>
                      <Link href={`/community/${user.uid}`} className="text-primary hover:underline text-xs">
                        {makeHandle(user.uid)}
                      </Link>
                      <span className="text-muted-foreground/50"> · </span>
                    </>
                  )}
                  <span className="text-xs">Seu perfil público</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={15} />
              Postar
            </Button>
          </div>
        </MotionItem>

        {/* Feed */}
        {loading ? (
          <MotionItem>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-full aspect-square" />
                  <div className="px-4 py-3 space-y-2">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </MotionItem>
        ) : error ? (
          <MotionItem>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              {error}
            </div>
          </MotionItem>
        ) : posts.length === 0 ? (
          <MotionItem>
            <div className="py-20 text-center">
              <ImageOff size={40} className="mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum post ainda.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Seja o primeiro a compartilhar seu cultivo!</p>
              <Button onClick={() => setOpen(true)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={14} className="mr-2" />
                Criar primeiro post
              </Button>
            </div>
          </MotionItem>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <MotionItem key={post.id}>
                <PostCard post={post} currentUserId={user?.uid ?? ""} />
              </MotionItem>
            ))}
          </div>
        )}

        {/* New post sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
            <SheetHeader className="mb-5">
              <SheetTitle className="flex items-center gap-2">
                <CalendarDays size={18} className="text-primary" />
                Novo Post
              </SheetTitle>
            </SheetHeader>
            <PostForm
              plants={plants}
              onSuccess={() => { setOpen(false); loadPosts(); }}
              onCancel={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </MotionPage>
  );
}
