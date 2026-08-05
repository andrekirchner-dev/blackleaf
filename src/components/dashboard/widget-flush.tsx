"use client";

import Link from "next/link";
import { addWeeks, differenceInDays, isAfter } from "date-fns";
import { Droplets, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plant } from "@/lib/types";

interface Props {
  plants: Plant[];
}

const FLUSH_WEEKS_DEFAULT = 2;

export function WidgetFlush({ plants }: Props) {
  const today = new Date();

  const floweringPlants = plants
    .filter((p) => p.stage === "floracao")
    .map((p) => {
      const flipDate = new Date(p.stageChangedAt);
      const totalWeeks = p.floweringWeeks ?? 8;
      const harvestDate = addWeeks(flipDate, totalWeeks);
      const flushDate = addWeeks(flipDate, totalWeeks - FLUSH_WEEKS_DEFAULT);
      const daysToFlush = differenceInDays(flushDate, today);
      const daysToHarvest = differenceInDays(harvestDate, today);
      const flushStarted = !isAfter(flushDate, today);
      const isReady = !isAfter(harvestDate, today);
      return { ...p, flushDate, harvestDate, daysToFlush, daysToHarvest, flushStarted, isReady };
    })
    .sort((a, b) => a.daysToHarvest - b.daysToHarvest);

  if (floweringPlants.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Droplets size={14} className="text-blue-400" />
          Flush & Colheita
        </h3>
        <Link
          href="/tools/flush"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Planejador
          <ExternalLink size={10} />
        </Link>
      </div>

      <div className="divide-y divide-border/30">
        {floweringPlants.map((p) => (
          <div key={p.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              {p.isReady ? (
                <span className="text-xs font-bold text-destructive shrink-0 ml-2">Colher!</span>
              ) : p.flushStarted ? (
                <span className="text-xs font-semibold text-amber-400 shrink-0 ml-2">Em flush ✓</span>
              ) : (
                <span className={cn(
                  "text-[11px] font-medium shrink-0 ml-2",
                  p.daysToFlush <= 7 ? "text-amber-400" : "text-muted-foreground"
                )}>
                  Flush em {p.daysToFlush}d
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className={cn(
                "flex items-center gap-1",
                p.flushStarted ? "text-amber-400 font-medium" : "text-muted-foreground/60"
              )}>
                💧 {p.flushDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </span>
              <span className={cn(
                "flex items-center gap-1",
                p.isReady ? "text-destructive font-medium" : "text-muted-foreground/60"
              )}>
                ✂️ {p.harvestDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                {!p.isReady && (
                  <span className="text-muted-foreground/40 ml-0.5">({p.daysToHarvest}d)</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
