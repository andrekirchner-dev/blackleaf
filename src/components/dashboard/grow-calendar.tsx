"use client";

import { useMemo } from "react";
import type { Plant, GrowStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_COLORS = {
  semente: "bg-yellow-500/40",
  muda:    "bg-lime-500/40",
  vegetativo: "bg-green-500/50",
  floracao:   "bg-orange-500/50",
  colheita:   "bg-amber-500/40",
};

// Tick color per phase (for day labels below each bar)
const PHASE_TICK: Record<string, string> = {
  seedling:  "text-lime-400/60",
  veg:       "text-green-400/60",
  flowering: "text-orange-400/60",
};

interface PlantTimeline {
  plant: Plant;
  germinationMs: number;
  seedlingDays: number;
  vegDays: number;
  floweringDays: number;
  totalWeeks: number;
  currentDayExact: number;
  style?: GrowStyle;
}

function buildTimeline(plant: Plant, style?: GrowStyle): PlantTimeline {
  const germinationMs = new Date(plant.germinationDate).getTime();
  const nowMs = Date.now();
  const seedlingWeeks = plant.seedlingWeeks ?? 2;
  const vegExtraDays  = plant.vegExtraDays ?? 0;
  const vegWeeks      = (plant.vegWeeks ?? style?.vegWeeks ?? 5) + vegExtraDays / 7;
  const floweringWeeks = plant.floweringWeeks ?? 9;
  const totalWeeks    = seedlingWeeks + vegWeeks + floweringWeeks;
  const currentDayExact = (nowMs - germinationMs) / 86_400_000;
  return {
    plant,
    germinationMs,
    seedlingDays:  seedlingWeeks * 7,
    vegDays:       vegWeeks * 7,
    floweringDays: floweringWeeks * 7,
    totalWeeks,
    currentDayExact,
    style,
  };
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

/** Compute which phase and day-in-phase the plant is currently at */
function getCurrentPhaseInfo(
  currentDayExact: number,
  seedlingDays: number,
  vegDays: number,
): { phase: string; dayInPhase: number } {
  const d = Math.max(0, Math.floor(currentDayExact));
  if (d < seedlingDays) return { phase: "Muda",    dayInPhase: d + 1 };
  if (d < seedlingDays + vegDays) return { phase: "Veg",     dayInPhase: d - seedlingDays + 1 };
  return { phase: "Floração", dayInPhase: d - seedlingDays - vegDays + 1 };
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

  const maxWeeks = Math.max(
    ...timelines.map((t) => Math.max(t.totalWeeks, Math.ceil(t.currentDayExact / 7) + 1))
  );
  const maxDays = maxWeeks * 7;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
      {/* ── Régua de Semanas (compartilhada) ─────────────────────── */}
      <div className="pl-[140px] min-w-[500px] mb-2">
        <div className="flex rounded-md overflow-hidden">
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
      </div>

      {/* ── Linhas das plantas ────────────────────────────────────── */}
      <div className="space-y-1 min-w-[500px]">
        {timelines.map(({
          plant, seedlingDays, vegDays, floweringDays,
          totalWeeks, currentDayExact, style,
        }) => {
          const clampedDay = Math.min(currentDayExact, maxDays);
          const todayPct   = (clampedDay / maxDays) * 100;
          const isActive   = currentDayExact >= 0 && currentDayExact <= maxDays + 7;

          const { phase: currentPhase, dayInPhase } = getCurrentPhaseInfo(
            currentDayExact, seedlingDays, vegDays
          );

          // Day ticks to render per phase (every 7 days, phase-relative)
          const phases: Array<{
            label: string;
            days: number;
            offsetDays: number;
            tickColor: string;
          }> = [
            { label: "Muda",    days: seedlingDays,  offsetDays: 0,                              tickColor: PHASE_TICK.seedling },
            { label: "Veg",     days: vegDays,        offsetDays: seedlingDays,                   tickColor: PHASE_TICK.veg },
            { label: "Floração",days: floweringDays,  offsetDays: seedlingDays + vegDays,         tickColor: PHASE_TICK.flowering },
          ];

          return (
            <div key={plant.id} className="flex items-start gap-3 group">
              {/* Nome da planta */}
              <div className="w-[132px] shrink-0 text-right pt-[5px]">
                <p className="text-xs font-semibold text-foreground truncate">{plant.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{plant.strain}</p>
              </div>

              {/* Coluna da timeline (barra + régua de dias por fase) */}
              <div className="flex-1 relative">
                {/* Barra de fases */}
                <div className="relative h-6">
                  {/* Fundo das fases com overflow hidden para borda arredondada */}
                  <div className="absolute inset-0 rounded-full overflow-hidden flex">
                    <PhaseBar weeks={seedlingDays / 7} total={maxWeeks} color={PHASE_COLORS.semente} label="Muda" />
                    <PhaseBar weeks={vegDays / 7}       total={maxWeeks} color={PHASE_COLORS.vegetativo} label="Vegetativo" />
                    <PhaseBar weeks={floweringDays / 7} total={maxWeeks} color={PHASE_COLORS.floracao} label="Floração" />
                    {/* Futuro */}
                    <div
                      className="h-full bg-border/20 rounded-r-full"
                      style={{ width: `${((maxWeeks - totalWeeks) / maxWeeks) * 100}%` }}
                    />
                  </div>

                  {/* Marcador "Hoje" — atravessa barra e régua de dias */}
                  {isActive && (
                    <div
                      className="absolute z-20 pointer-events-none"
                      style={{ left: `${todayPct}%` }}
                    >
                      {/* Losango no topo */}
                      <div className="absolute w-2 h-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] rotate-45"
                        style={{ top: '2px', left: '-4px' }} />
                      {/* Linha vertical pela barra + régua de dias (26px barra + 16px régua) */}
                      <div
                        className="absolute w-[1.5px] bg-white/90 shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                        style={{ top: '2px', height: 'calc(100% + 16px)', left: '-0.5px' }}
                      />
                    </div>
                  )}
                </div>

                {/* ── Régua de dias sequenciais por fase ─────────── */}
                <div className="relative h-4 mt-0.5">
                  {phases.flatMap(({ days, offsetDays, tickColor }) => {
                    // Gera ticks a cada 7 dias dentro da fase
                    const ticks: React.ReactNode[] = [];
                    const totalPhaseDays = Math.ceil(days);
                    for (let d = 7; d <= totalPhaseDays; d += 7) {
                      const absPct = ((offsetDays + d) / maxDays) * 100;
                      // Não ultrapassa o fim do calendário
                      if (absPct > 100) break;
                      ticks.push(
                        <div
                          key={`${offsetDays}-${d}`}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${absPct}%`, transform: "translateX(-50%)" }}
                        >
                          <div className="w-px h-1.5 bg-border/40" />
                          <span className={cn("text-[6.5px] font-medium leading-none mt-px", tickColor)}>
                            {d}
                          </span>
                        </div>
                      );
                    }
                    return ticks;
                  })}

                  {/* Linha separadora das fases */}
                  {[seedlingDays, seedlingDays + vegDays].map((boundaryDay) => {
                    const pct = (boundaryDay / maxDays) * 100;
                    if (pct <= 0 || pct >= 100) return null;
                    return (
                      <div
                        key={boundaryDay}
                        className="absolute top-0 w-px h-full bg-border/30"
                        style={{ left: `${pct}%` }}
                      />
                    );
                  })}
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

              {/* Badge — mostra dia na fase atual */}
              <div className="w-16 shrink-0 text-right pt-[5px]">
                {currentDayExact > 0 ? (
                  <div>
                    <p className="text-[10px] font-semibold text-foreground leading-none">
                      D{dayInPhase}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
                      {currentPhase}
                    </p>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Início</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legenda ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
        {[
          { color: PHASE_COLORS.semente,   label: "Muda" },
          { color: PHASE_COLORS.vegetativo, label: "Vegetativo" },
          { color: PHASE_COLORS.floracao,   label: "Floração" },
          { color: "bg-white/90",           label: "Hoje" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-2.5 rounded-sm", color)} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
        <span className="text-[9px] text-muted-foreground/40 ml-auto">
          Números = dias sequenciais por fase
        </span>
      </div>
    </div>
  );
}
