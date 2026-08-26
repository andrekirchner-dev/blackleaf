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
  currentDayExact: number;
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
  const currentDayExact = (nowMs - germinationMs) / 86_400_000;
  return { plant, germinationMs, seedlingWeeks, vegWeeks, floweringWeeks, totalWeeks, currentDayExact, style };
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

  const maxWeeks = Math.max(...timelines.map((t) => Math.max(t.totalWeeks, Math.ceil(t.currentDayExact / 7) + 1)));
  const maxDays = maxWeeks * 7;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
      {/* ── Régua ────────────────────────────────────────────────── */}
      <div className="pl-[140px] min-w-[500px] mb-3">

        {/* Linha 1 — Semanas com highlight alternado */}
        <div className="flex rounded-t-md overflow-hidden">
          {Array.from({ length: maxWeeks }, (_, wIdx) => (
            <div
              key={wIdx}
              className={cn(
                "flex-1 text-center text-[9px] font-semibold py-1 border-r border-black/10 last:border-0 leading-none",
                wIdx % 2 === 0
                  ? "bg-primary/10 text-primary/70"
                  : "bg-muted/30 text-muted-foreground/50"
              )}
            >
              S{wIdx + 1}
            </div>
          ))}
        </div>

        {/* Linha 2 — Dias (1–7 dentro de cada semana) */}
        <div className="flex rounded-b-md overflow-hidden">
          {Array.from({ length: maxWeeks }, (_, wIdx) => (
            <div
              key={wIdx}
              className={cn(
                "flex-1 flex",
                wIdx % 2 === 0 ? "bg-primary/[0.04]" : "bg-muted/10"
              )}
            >
              {Array.from({ length: 7 }, (_, d) => (
                <div
                  key={d}
                  className={cn(
                    "flex-1 h-3.5 flex items-center justify-center border-r border-black/[0.06] last:border-0",
                    d === 0 ? "border-l-0" : ""
                  )}
                >
                  <span
                    className={cn(
                      "text-[6.5px] font-medium leading-none",
                      d === 0
                        ? "text-primary/50"
                        : "text-muted-foreground/25"
                    )}
                  >
                    {d + 1}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Barras das plantas ───────────────────────────────────── */}
      <div className="space-y-3 min-w-[500px]">
        {timelines.map(({ plant, seedlingWeeks, vegWeeks, floweringWeeks, totalWeeks, currentDayExact, style }) => {
          const clampedDay = Math.min(currentDayExact, maxDays);
          const todayPct = (clampedDay / maxDays) * 100;
          const isActive = currentDayExact >= 0 && currentDayExact <= maxDays + 7;

          return (
            <div key={plant.id} className="flex items-center gap-3 group">
              {/* Nome da planta */}
              <div className="w-[132px] shrink-0 text-right">
                <p className="text-xs font-semibold text-foreground truncate">{plant.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{plant.strain}</p>
              </div>

              {/* Barra de timeline */}
              <div className="flex-1 relative">
                {/* Barra de fases */}
                <div className="relative h-6 flex rounded-full overflow-visible">
                  {/* Clip inner para arredondamento */}
                  <div className="absolute inset-0 rounded-full overflow-hidden flex w-full">
                    <PhaseBar weeks={seedlingWeeks} total={maxWeeks} color={PHASE_COLORS.semente} label="Muda" />
                    <PhaseBar weeks={vegWeeks} total={maxWeeks} color={PHASE_COLORS.vegetativo} label="Vegetativo" />
                    <PhaseBar weeks={floweringWeeks} total={maxWeeks} color={PHASE_COLORS.floracao} label="Floração" />
                    {/* Futuro */}
                    <div
                      className="h-full bg-border/20 rounded-r-full"
                      style={{ width: `${((maxWeeks - totalWeeks) / maxWeeks) * 100}%` }}
                    />
                  </div>

                  {/* Marcador do dia atual — cruza a barra + sobe até a régua */}
                  {isActive && (
                    <div
                      className="absolute z-10 pointer-events-none"
                      style={{ left: `${todayPct}%` }}
                    >
                      {/* Linha vertical — sobe 32px acima (régua) + desce toda a barra */}
                      <div className="absolute w-[1.5px] bg-white/90 shadow-[0_0_5px_rgba(255,255,255,0.9)]"
                        style={{
                          top: '-34px',   /* sobe até a régua */
                          height: 'calc(34px + 100%)',
                          left: '-0.5px',
                        }}
                      />
                      {/* Losango no topo (indicador "hoje" na régua) */}
                      <div
                        className="absolute w-2 h-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] rotate-45"
                        style={{ top: '-38px', left: '-4px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Eventos do estilo de cultivo */}
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

              {/* Badge da semana atual */}
              <div className="w-12 shrink-0 text-right">
                <span className="text-[10px] text-muted-foreground">
                  {currentDayExact > 0
                    ? `S${Math.floor(currentDayExact / 7) + 1} D${(Math.floor(currentDayExact) % 7) + 1}`
                    : "Início"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legenda ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
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
        <span className="text-[9px] text-muted-foreground/40 ml-auto">S = Semana · D = Dia</span>
      </div>
    </div>
  );
}
