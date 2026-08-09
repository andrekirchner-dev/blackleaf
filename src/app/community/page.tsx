"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getCommunityFeed } from "@/lib/community";
import type { CommunityUser } from "@/lib/community";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import { Leaf, LayoutGrid, Users, Loader2 } from "lucide-react";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

const GENETICS_LABELS: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hibrida: "Híbrida",
  autoflowering: "Auto",
};

const SPACE_TYPE_LABELS: Record<string, string> = {
  tenda: "Tenda",
  armario: "Armário",
  quarto: "Quarto",
  estufa: "Estufa",
};

function daysInStage(stageChangedAt: string): number {
  return differenceInDays(new Date(), new Date(stageChangedAt));
}

function PlantCard({ plant }: { plant: CommunityUser["plants"][0] }) {
  const days = daysInStage(plant.stageChangedAt);
  const stageClass = STAGE_COLORS[plant.stage] ?? "bg-muted/10 text-muted-foreground border-border";

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden flex flex-col">
      {plant.photoUrl ? (
        <div className="h-32 overflow-hidden">
          <img
            src={plant.photoUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-muted/20 flex items-center justify-center">
          <Leaf size={28} className="text-muted-foreground/30" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-foreground leading-tight truncate">{plant.name}</p>
          <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${stageClass}`}>
            {STAGE_LABELS[plant.stage]}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{plant.strain}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          {plant.genetics && (
            <span className="text-[10px] text-muted-foreground/60 bg-muted/20 rounded px-1.5 py-0.5">
              {GENETICS_LABELS[plant.genetics] ?? plant.genetics}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {days}d nesta fase
          </span>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, currentUserId }: { user: CommunityUser; currentUserId: string }) {
  const isMe = user.userId === currentUserId;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {user.handle.slice(-2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isMe ? "Você" : user.handle}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {user.spaces.length} espaço{user.spaces.length !== 1 ? "s" : ""} · {user.plants.length} planta{user.plants.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isMe && (
          <span className="ml-auto text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">
            Você
          </span>
        )}
      </div>

      {/* Spaces */}
      {user.spaces.length > 0 && (
        <div className="space-y-2">
          {user.spaces.map((space) => {
            const spacePlants = user.plants.filter((p) => p.spaceId === space.id);
            return (
              <div key={space.id} className="bg-background/60 border border-border/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid size={12} className="text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">{space.name}</p>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">
                    {SPACE_TYPE_LABELS[space.type] ?? space.type} · {space.widthCm}×{space.depthCm}cm
                  </span>
                </div>
                {spacePlants.length > 0 ? (
                  <div className={`grid gap-2 ${spacePlants.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
                    {spacePlants.map((plant) => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/40 text-center py-2">Sem plantas neste espaço</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plants without space */}
      {(() => {
        const spaceless = user.plants.filter((p) => !p.spaceId);
        if (!spaceless.length) return null;
        return (
          <div>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-2">Sem espaço definido</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {spaceless.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getCommunityFeed()
      .then((data) => {
        // Put current user first
        const sorted = [...data].sort((a, b) => {
          if (a.userId === user.uid) return -1;
          if (b.userId === user.uid) return 1;
          return b.plants.length - a.plants.length;
        });
        setFeed(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <MotionPage>
      <div className="space-y-6 max-w-4xl mx-auto">
        <MotionItem>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Comunidade</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Veja o cultivo de outros growers</p>
            </div>
          </div>
        </MotionItem>

        {loading ? (
          <MotionItem>
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          </MotionItem>
        ) : error ? (
          <MotionItem>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              Erro ao carregar comunidade: {error}
            </div>
          </MotionItem>
        ) : feed.length === 0 ? (
          <MotionItem>
            <div className="py-16 text-center">
              <Users size={40} className="mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum grower encontrado ainda.</p>
            </div>
          </MotionItem>
        ) : (
          <div className="space-y-4">
            {feed.map((communityUser) => (
              <MotionItem key={communityUser.userId}>
                <UserCard user={communityUser} currentUserId={user?.uid ?? ""} />
              </MotionItem>
            ))}
          </div>
        )}
      </div>
    </MotionPage>
  );
}
