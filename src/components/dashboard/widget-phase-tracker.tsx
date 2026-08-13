"use client";

import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import type { Plant, GrowStage } from "@/lib/types";

interface Props {
  plants: Plant[];
}

const STAGE_DURATION: Record<GrowStage, number> = {
  semente: 7,
  muda: 21,
  vegetativo: 56,
  floracao: 63,
  colheita: 7,
  secagem: 14,
};

export function WidgetPhaseTracker({ plants }: Props) {
  const today = new Date();
  const active = plants.filter((p) => !p.archived);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CalendarDays size={14} className="text-primary" />
          Contador de Fases
          {active.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-medium">
              {active.length}
            </span>
          )}
        </h3>
        <Link href="/plants" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver plantas →
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma planta cadastrada</p>
          <Link href="/plants/new" className="text-xs text-primary mt-1 block hover:underline">
            Adicionar planta →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {active.map((plant) => {
            const daysInStage = differenceInDays(today, parseISO(plant.stageChangedAt));
            const totalDays = differenceInDays(today, parseISO(plant.germinationDate));
            const stageDuration = STAGE_DURATION[plant.stage];
            const progress = Math.min(100, Math.round((daysInStage / stageDuration) * 100));

            return (
              <div key={plant.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{plant.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{plant.strain}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      STAGE_COLORS[plant.stage]
                    )}>
                      {STAGE_LABELS[plant.stage]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                  <span>{daysInStage}d na fase</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{totalDays}d total</span>
                </div>
                <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
