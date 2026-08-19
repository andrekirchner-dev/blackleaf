"use client";

import { useMemo } from "react";
import type { Plant, GrowStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_COLORS = {
  semente: "bg-yellow-500/40",
  muda: "bg-lime-500/40",
  vegetativo: "bg-green-500/50",
  floracao: "bg-orange-500/50",
  colheita: "bg-amber-500/40",
};

interface PlantTimeline {
  plant: Plant;
  germinationMs: number;
  seedlingWeeks: number;
  vegWeeks: number;
  floweringWeeks: number;
  totalWeeks: number;
  currentWeek: number;
  style?: GrowStyle;
}

function buildTimeline(plant: Plant, style?: GrowStyle): PlantTimeline {
  const germinationMs = new Date(plant.germinationDate).getTime();
  const nowMs = Date.now();
  const seedlingWeeks = plant.seedlingWeeks ?? 2;
  const vegExtraDays = plant.vegExtraDays ?? 0;
  const vegWeeks = (plant.vegWeeks ?? style?.vegWeeks ?? 5) + vegExtraDays / 7;
  const floweringWeeks = plant.floweringWeeks ?? 9;
  const totalWeeks = seedlingWeeks + vegWeeks + floweringWeeks;
  const currentWeek = Math.floor((nowMs - germinationMs) / (7 * 86_400_000));
  return { plant, germinationMs, seedlingWeeks, vegWeeks, floweringWeeks, totalWeeks, currentWeek, style };
}

function PhaseBar({ weeks, total, color, label }: {
  weeks: number; total: number; color: string; label: string;
}) {
  const pct = (weeks / total) * 100;
  return (
    <div
      className={cn("relative h-full flex items-center justify-center overflow-hidden first:rounded-l-full last:rounded-r-full", color)}
      style={{ width: `${pct}%` }}
    >
      {pct > 12 && (
        <span className="text-[9px] font-medium text-white/80 truncate px-1">{label}</span>
      )}
    </div>
  );
}

interface Props {
  plants: Plant[];
  styles: GrowStyle[];
}

export function GrowCalendar({ plants, styles }: Props) {
  const timelines = useMemo(
    () => plants
      .filter((p) => p.germinationDate && !["colheita", "secagem"].includes(p.stage))
      .map((p) => {
        const style = styles.find((s) => s.id === p.growStyleId);
        return buildTimeline(p, style);
      })
      .sort((a, b) => a.germinationMs - b.germinationMs),
    [plants, styles]
  );

  if (!timelines.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <span className="text-3xl block mb-2">📅</span>
        <p className="text-sm font-medium text-muted-foreground">Nenhuma planta ativa no calendário.</p>
      </div>
    );
  }

  const maxWeeks = Math.max(...timelines.map((t) => Math.max(t.totalWeeks, t.currentWeek + 1)));

  return (
    <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
      {/* Week header */}
      <div className="flex mb-3 pl-[140px] min-w-[500px]">
        {Array.from({ length: maxWeeks + 1 }, (_, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground/60 font-medium">
            {i > 0 && `S${i}`}
          </div>
        ))}
      </div>

      <div className="space-y-3 min-w-[500px]">
        {timelines.map(({ plant, seedlingWeeks, vegWeeks, floweringWeeks, totalWeeks, currentWeek, style }) => {
          const clampedWeek = Math.min(currentWeek, maxWeeks);
          const todayPct = (clampedWeek / maxWeeks) * 100;

          return (
            <div key={plant.id} className="flex items-center gap-3 group">
              {/* Plant name */}
              <div className="w-[132px] shrink-0 text-right">
                <p className="text-xs font-semibold text-foreground truncate">{plant.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{plant.strain}</p>
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative">
                <div className="relative h-6 flex rounded-full overflow-hidden">
                  <PhaseBar weeks={seedlingWeeks} total={maxWeeks} color={PHASE_COLORS.semente} label="Muda" />
                  <PhaseBar weeks={vegWeeks} total={maxWeeks} color={PHASE_COLORS.vegetativo} label="Vegetativo" />
                  <PhaseBar weeks={floweringWeeks} total={maxWeeks} color={PHASE_COLORS.floracao} label="Floração" />
                  {/* Remaining (future) */}
                  <div
                    className="h-full bg-border/20 rounded-r-full"
                    style={{ width: `${((maxWeeks - totalWeeks) / maxWeeks) * 100}%` }}
                  />

                  {/* Today marker */}
                  {currentWeek >= 0 && currentWeek <= maxWeeks && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10 shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                </div>

                {/* Style events */}
                {style?.events && style.events.length > 0 && (
                  <div className="relative h-4 mt-0.5">
                    {style.events.map((ev, idx) => {
                      const evPct = (ev.weekOffset / maxWeeks) * 100;
                      return (
                        <div
                          key={idx}
                          className="absolute -translate-x-1/2 group/ev"
                          style={{ left: `${evPct}%` }}
                          title={ev.label}
                        >
                          <span className="text-[10px] cursor-default">{ev.emoji}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/ev:block z-20 bg-popover border border-border rounded-lg px-2 py-1 text-[10px] text-foreground whitespace-nowrap shadow-lg">
                            S{ev.weekOffset}: {ev.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Week badge */}
              <div className="w-12 shrink-0 text-right">
                <span className="text-[10px] text-muted-foreground">
                  {currentWeek > 0 ? `S${currentWeek}` : "Início"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        {[
          { color: PHASE_COLORS.semente, label: "Muda" },
          { color: PHASE_COLORS.vegetativo, label: "Vegetativo" },
          { color: PHASE_COLORS.floracao, label: "Floração" },
          { color: "bg-white/90", label: "Hoje" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-2.5 rounded-sm", color)} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
