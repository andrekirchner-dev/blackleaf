"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getUserPublicProfile, makeHandle } from "@/lib/community";
import type { UserPublicProfile, CommunityPost } from "@/lib/community";
import { STAGE_LABELS, STAGE_COLORS, MEDIUM_LABELS } from "@/lib/constants";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Leaf, Sprout, Award, CalendarDays, Scale, ImageOff } from "lucide-react";
import { differenceInDays, format, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PublicPlant } from "@/lib/community";

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

function PlantRow({ plant }: { plant: PublicPlant }) {
  const days = differenceInDays(new Date(), parseISO(plant.stageChangedAt));
  const stageClass = STAGE_COLORS[plant.stage] ?? "bg-muted/10 text-muted-foreground border-border";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {plant.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plant.photoUrl} alt={plant.name} className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0">
          <Leaf size={16} className="text-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{plant.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{plant.strain}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground">{days}d</span>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", stageClass)}>
          {STAGE_LABELS[plant.stage]}
        </span>
      </div>
    </div>
  );
}

function PostThumbnail({ post }: { post: CommunityPost }) {
  return (
    <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted/20 relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.photoUrl} alt="Post" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <p className="text-[10px] text-white line-clamp-2 leading-tight">{post.caption}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getUserPublicProfile(userId)
      .then(setProfile)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, [userId]);

  const isMe = user?.uid === userId;
  const handle = isMe ? "Você" : (profile?.handle ?? makeHandle(userId ?? ""));

  const firstGrowLabel = profile?.firstGrowDate
    ? format(parseISO(profile.firstGrowDate), "MMM yyyy", { locale: ptBR })
    : "—";

  return (
    <MotionPage>
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Back */}
        <MotionItem>
          <Link
            href="/community"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={14} />
            Comunidade
          </Link>
        </MotionItem>

        {loading ? (
          <MotionItem>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-40 rounded-xl" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
              </div>
            </div>
          </MotionItem>
        ) : error ? (
          <MotionItem>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              {error}
            </div>
          </MotionItem>
        ) : !profile ? (
          <MotionItem>
            <div className="py-20 text-center text-sm text-muted-foreground">
              Perfil não encontrado.
            </div>
          </MotionItem>
        ) : (
          <>
            {/* Profile header */}
            <MotionItem>
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary">
                    {profile.handle.slice(-2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">{handle}</h1>
                    {isMe && (
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {profile.activePlants.length} planta{profile.activePlants.length !== 1 ? "s" : ""} ativa{profile.activePlants.length !== 1 ? "s" : ""}
                    {profile.spaces.length > 0 && (
                      <> · {profile.spaces.length} espaço{profile.spaces.length !== 1 ? "s" : ""}</>
                    )}
                  </p>
                </div>
              </div>
            </MotionItem>

            {/* Stats */}
            <MotionItem>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<Award size={12} />}
                  label="Ciclos"
                  value={String(profile.harvestCount)}
                />
                <StatCard
                  icon={<Scale size={12} />}
                  label="Colhido"
                  value={profile.totalDryWeightG > 0 ? `${profile.totalDryWeightG}g` : "—"}
                />
                <StatCard
                  icon={<CalendarDays size={12} />}
                  label="1º cultivo"
                  value={firstGrowLabel}
                />
              </div>
            </MotionItem>

            {/* Current grow */}
            {profile.activePlants.length > 0 && (
              <MotionItem>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout size={14} className="text-primary" />
                    <h2 className="text-sm font-semibold">Cultivo Atual</h2>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {profile.activePlants.length} planta{profile.activePlants.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    {profile.activePlants.map((plant) => (
                      <PlantRow key={plant.id} plant={plant} />
                    ))}
                  </div>
                </div>
              </MotionItem>
            )}

            {/* Spaces summary */}
            {profile.spaces.length > 0 && (
              <MotionItem>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h2 className="text-sm font-semibold mb-3">Espaços de Cultivo</h2>
                  <div className="space-y-2">
                    {profile.spaces.map((space) => (
                      <div key={space.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{space.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {space.widthCm}×{space.depthCm}×{space.heightCm}cm
                            {space.lightType && <span> · {LIGHT_LABELS[space.lightType] ?? space.lightType}{space.lightWatts ? ` ${space.lightWatts}W` : ""}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionItem>
            )}

            {/* Posts */}
            <MotionItem>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold">Posts</h2>
                  <span className="text-[10px] text-muted-foreground/60">{profile.recentPosts.length}</span>
                </div>
                {profile.recentPosts.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl py-12 text-center">
                    <ImageOff size={28} className="mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {isMe ? "Você ainda não postou nada." : "Nenhum post ainda."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {profile.recentPosts.map((post) => (
                      <PostThumbnail key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </MotionItem>
          </>
        )}
      </div>
    </MotionPage>
  );
}
