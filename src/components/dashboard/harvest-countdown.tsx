"use client";

import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plant } from "@/lib/types";

interface Props {
  plants: Plant[];
}

interface FloweringPlant {
  plant: Plant;
  daysInFlower: number;
  totalDays: number;
  daysRemaining: number;
  progressPercent: number;
  weekCurrent: number;
  weekTotal: number;
}

function getBadgeStyle(daysRemaining: number): string {
  if (daysRemaining <= 0) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (daysRemaining <= 3) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (daysRemaining <= 7) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (daysRemaining <= 14) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-primary/20 text-primary border-primary/30";
}

function getBadgeLabel(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Pronta!";
  if (daysRemaining <= 3) return "Urgente";
  if (daysRemaining <= 7) return "Em breve";
  if (daysRemaining <= 14) return "Quase lá";
  return "Em floração";
}

export function HarvestCountdown({ plants }: Props) {
  const floweringPlants = useMemo<FloweringPlant[]>(() => {
    const today = new Date();

    return plants
      .filter((p) => p.stage === "floracao" && p.stageChangedAt)
      .map((plant) => {
        const floweringWeeks = plant.floweringWeeks ?? 8;
        const totalDays = floweringWeeks * 7;
        const daysInFlower = differenceInDays(today, parseISO(plant.stageChangedAt));
        const daysRemaining = totalDays - daysInFlower;
        const progressPercent = Math.min((daysInFlower / totalDays) * 100, 100);
        const weekCurrent = Math.min(Math.floor(daysInFlower / 7) + 1, floweringWeeks);
        const weekTotal = floweringWeeks;

        return {
          plant,
          daysInFlower,
          totalDays,
          daysRemaining,
          progressPercent,
          weekCurrent,
          weekTotal,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [plants]);

  if (floweringPlants.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Scissors size={14} className="text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Contagem para Colheita</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {floweringPlants.length} {floweringPlants.length === 1 ? "planta" : "plantas"}
        </span>
      </div>

      {/* Plant rows */}
      <div className="divide-y divide-border/40">
        {floweringPlants.map(({
          plant,
          daysRemaining,
          progressPercent,
          weekCurrent,
          weekTotal,
        }) => (
          <div key={plant.id} className="px-4 py-3 space-y-2">
            {/* Name + badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{plant.name}</p>
                {plant.strain && (
                  <p className="text-xs text-muted-foreground truncate">{plant.strain}</p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                  getBadgeStyle(daysRemaining)
                )}
              >
                {getBadgeLabel(daysRemaining)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  daysRemaining <= 0
                    ? "bg-red-500"
                    : daysRemaining <= 3
                    ? "bg-red-500"
                    : daysRemaining <= 7
                    ? "bg-orange-400"
                    : daysRemaining <= 14
                    ? "bg-yellow-400"
                    : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Week info + days remaining */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Semana <span className="text-foreground font-medium">{weekCurrent}</span> de{" "}
                <span className="text-foreground font-medium">{weekTotal}</span>
              </span>
              {daysRemaining <= 0 ? (
                <span className="text-red-400 font-semibold">Pronta para colheita!</span>
              ) : (
                <span>
                  <span className="text-foreground font-medium">{daysRemaining}</span>{" "}
                  {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
