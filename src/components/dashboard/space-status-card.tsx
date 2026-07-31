"use client";

import type { GrowSpace, Plant, GrowStage } from "@/lib/types";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import { getSpaceMeta } from "@/lib/space-constants";
import { cn } from "@/lib/utils";

const STAGE_PRIORITY: GrowStage[] = [
  "floracao", "vegetativo", "muda", "semente", "secagem", "colheita",
];

function dominantStage(plants: Plant[]): GrowStage | null {
  if (!plants.length) return null;
  for (const stage of STAGE_PRIORITY) {
    if (plants.some((p) => p.stage === stage)) return stage;
  }
  return plants[0].stage;
}

interface Props {
  space: GrowSpace;
  plants: Plant[];
  onClick: () => void;
}

export function SpaceStatusCard({ space, plants, onClick }: Props) {
  const meta = getSpaceMeta(space.type);
  const stage = dominantStage(plants);
  const activePlants = plants.filter((p) => !["colheita", "secagem"].includes(p.stage));

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-52 bg-card border border-border rounded-2xl p-4 text-left transition-all hover:border-primary/40 hover:bg-card/80 active:scale-95"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{meta.emoji}</span>
        {stage && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
            STAGE_COLORS[stage]
          )}>
            {STAGE_LABELS[stage]}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground truncate">{space.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{meta.label}</p>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="flex -space-x-1">
          {plants.slice(0, 4).map((_, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full bg-primary/20 border border-card flex items-center justify-center"
            >
              <span className="text-[8px]">🌿</span>
            </div>
          ))}
          {plants.length > 4 && (
            <div className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">+{plants.length - 4}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {plants.length} {plants.length === 1 ? "planta" : "plantas"}
          {activePlants.length !== plants.length && ` · ${activePlants.length} ativas`}
        </span>
      </div>
    </button>
  );
}
