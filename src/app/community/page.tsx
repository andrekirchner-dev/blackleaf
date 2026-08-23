"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getCommunityPosts,
  getTopCommunityPosts,
  getPostsLikedByUser,
  getSavedPostIds,
} from "@/lib/community";
import { usePlants } from "@/hooks/use-plants";
import type { CommunityPost } from "@/lib/community";
import { PostForm } from "@/components/community/post-form";
import { PostCard } from "@/components/community/post-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Users, Plus, ImageOff, Globe, Heart, UserCircle2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "global" | "curtidos" | "seguindo";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "global", label: "Global", icon: <Globe size={14} /> },
  { id: "curtidos", label: "Curtidos", icon: <Heart size={14} /> },
  { id: "seguindo", label: "Seguindo", icon: <Users size={14} /> },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { plants } = usePlants();

  const [tab, setTab] = useState<Tab>("global");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function loadPosts(currentTab: Tab) {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let data: CommunityPost[] = [];
      if (currentTab === "global") {
        data = await getCommunityPosts(50);
      } else if (currentTab === "curtidos") {
        data = await getTopCommunityPosts(30);
      }
      setPosts(data);
      if (data.length > 0) {
        const ids = data.map((p) => p.id);
        const [liked, saved] = await Promise.all([
          getPostsLikedByUser(user.uid, ids),
          getSavedPostIds(user.uid, ids),
        ]);
        setLikedIds(liked);
        setSavedIds(saved);
      } else {
        setLikedIds(new Set());
        setSavedIds(new Set());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadPosts(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  function handleLikeToggle(postId: string, nowLiked: boolean) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nowLiked) next.add(postId);
      else next.delete(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likesCount: p.likesCount + (nowLiked ? 1 : -1) }
          : p
      )
    );
  }

  function handleSaveToggle(postId: string, nowSaved: boolean) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  function handleDeleted(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  const isFollowingTab = tab === "seguindo";

  return (
    <MotionPage>
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <MotionItem>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Comunidade</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Feed de posts dos growers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user && (
                <Link
                  href={`/community/${user.uid}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <UserCircle2 size={14} />
                  Meu Perfil
                </Link>
              )}
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                <Plus size={14} />
                Postar
              </Button>
            </div>
          </div>
        </MotionItem>

        {/* Tabs */}
        <MotionItem>
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  tab === id
                    ? "bg-card border border-border text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </MotionItem>

        {/* Feed */}
        {isFollowingTab ? (
          <MotionItem>
            <div className="py-20 text-center">
              <Users size={40} className="mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Siga alguns growers para descobrir seus posts
              </p>
            </div>
          </MotionItem>
        ) : loading ? (
          <MotionItem>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-full aspect-video" />
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
              <ImageOff
                size={40}
                className="mx-auto text-muted-foreground/20 mb-3"
              />
              <p className="text-sm font-medium text-muted-foreground">
                {tab === "curtidos"
                  ? "Nenhum post em destaque ainda."
                  : "Nenhum post ainda."}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Seja o primeiro a compartilhar seu cultivo!
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={14} className="mr-2" />
                Criar primeiro post
              </Button>
            </div>
          </MotionItem>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <MotionItem key={post.id}>
                <PostCard
                  post={post}
                  isLiked={likedIds.has(post.id)}
                  isSaved={savedIds.has(post.id)}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleSaveToggle}
                  onDeleted={handleDeleted}
                />
              </MotionItem>
            ))}
          </div>
        )}

        {/* New post sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md bg-card border-border overflow-y-auto"
          >
            <SheetHeader className="mb-5">
              <SheetTitle className="flex items-center gap-2">
                <CalendarDays size={18} className="text-primary" />
                Novo Post
              </SheetTitle>
            </SheetHeader>
            <PostForm
              plants={plants}
              onSuccess={() => {
                setOpen(false);
                loadPosts(tab);
              }}
              onCancel={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </MotionPage>
  );
}
