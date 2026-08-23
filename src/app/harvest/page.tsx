"use client";

"use client";

import { useState } from "react";
import { useHarvest } from "@/hooks/use-harvest";
import { usePlants } from "@/hooks/use-plants";
import { deleteHarvestLog } from "@/lib/harvest";
import { HarvestForm } from "@/components/harvest/harvest-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Wheat, Plus, Trash2, Star, Droplets, Wind, Package, BarChart2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { HarvestLog } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

const TRICHOME_LABELS: Record<NonNullable<HarvestLog["trichomeStage"]>, string> = {
  transparente: "Transparente",
  leitoso: "Leitoso",
  ambar_50: "50% Âmbar",
  ambar_100: "100% Âmbar",
};

const TRICHOME_COLORS: Record<NonNullable<HarvestLog["trichomeStage"]>, string> = {
  transparente: "bg-sky-500/15 border-sky-500/30 text-sky-400",
  leitoso: "bg-slate-400/15 border-slate-400/30 text-slate-300",
  ambar_50: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  ambar_100: "bg-orange-500/15 border-orange-500/30 text-orange-400",
};

function HarvestTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg space-y-0.5">
      <p className="text-muted-foreground">{entry.payload.strain}</p>
      <p className="text-foreground font-semibold">{entry.value != null ? `${String(entry.value)}g` : "—"}</p>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={cn(s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export default function HarvestPage() {
  const { harvests, loading, refresh } = useHarvest();
  const { plants } = usePlants();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Deletar este registro de colheita?")) return;
    setDeleting(id);
    try {
      await deleteHarvestLog(id);
      await refresh();
    } finally {
      setDeleting(null);
    }
  }

  // Summary stats
  const totalHarvests = harvests.length;
  const totalCuredG = harvests.reduce((acc, h) => acc + (h.curedWeightG ?? 0), 0);
  const avgCuredG = totalHarvests > 0 && totalCuredG > 0 ? totalCuredG / totalHarvests : 0;

  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <MotionItem>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wheat size={22} className="text-primary" />
                Colheitas
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalHarvests > 0
                  ? `${totalHarvests} colheita${totalHarvests > 1 ? "s" : ""} registrada${totalHarvests > 1 ? "s" : ""}`
                  : "Nenhuma colheita registrada ainda"}
              </p>
            </div>
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0"
              size="sm"
            >
              <Plus size={15} />
              Registrar
            </Button>
          </div>
        </MotionItem>

        {/* Summary stats */}
        {!loading && totalHarvests > 0 && (
          <MotionItem>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{totalHarvests}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Colheitas</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-accent">
                  {totalCuredG > 0 ? `${totalCuredG.toFixed(1)}g` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total curado</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {avgCuredG > 0 ? `${avgCuredG.toFixed(1)}g` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Média/colheita</p>
              </div>
            </div>
          </MotionItem>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-card" />
            ))}
          </div>
        ) : harvests.length === 0 ? (
          <MotionItem>
            <div className="text-center py-24 space-y-3">
              <div className="text-5xl">🌾</div>
              <p className="text-muted-foreground font-medium">Sua primeira colheita está chegando!</p>
              <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                Registre cada colheita para acompanhar rendimentos, evolução de pesos e histórico de strains.
              </p>
              <Button
                onClick={() => setFormOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-2"
                size="sm"
              >
                <Plus size={14} />
                Registrar primeira colheita
              </Button>
            </div>
          </MotionItem>
        ) : (
          <div className="space-y-3">
            {harvests.map((h) => {
              const yieldPct =
                h.wetWeightG && h.dryWeightG && h.wetWeightG > 0
                  ? ((h.dryWeightG / h.wetWeightG) * 100).toFixed(1)
                  : null;

              return (
                <MotionItem key={h.id}>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3 p-4 pb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{h.plantName}</p>
                        <p className="text-sm text-muted-foreground truncate">{h.strain}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {h.trichomeStage && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full border text-[10px] font-medium",
                            TRICHOME_COLORS[h.trichomeStage]
                          )}>
                            {TRICHOME_LABELS[h.trichomeStage]}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id)}
                          disabled={deleting === h.id}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Weights row */}
                    {(h.wetWeightG || h.dryWeightG || h.curedWeightG) && (
                      <div className="flex items-center gap-4 px-4 py-2 bg-muted/10 border-t border-border/60">
                        {h.wetWeightG && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Droplets size={12} className="text-sky-400" />
                            <span className="text-muted-foreground">Úmido</span>
                            <span className="font-medium text-foreground">{h.wetWeightG}g</span>
                          </div>
                        )}
                        {h.wetWeightG && h.dryWeightG && (
                          <span className="text-muted-foreground/30 text-xs">→</span>
                        )}
                        {h.dryWeightG && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Wind size={12} className="text-amber-400" />
                            <span className="text-muted-foreground">Seco</span>
                            <span className="font-medium text-foreground">{h.dryWeightG}g</span>
                          </div>
                        )}
                        {h.dryWeightG && h.curedWeightG && (
                          <span className="text-muted-foreground/30 text-xs">→</span>
                        )}
                        {h.curedWeightG && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Package size={12} className="text-primary" />
                            <span className="text-muted-foreground">Curado</span>
                            <span className="font-medium text-primary">{h.curedWeightG}g</span>
                          </div>
                        )}
                        {yieldPct && (
                          <span className="ml-auto text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                            {yieldPct}% rendimento
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border/60">
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(h.harvestDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        {h.floweringWeeks && (
                          <span className="text-xs text-muted-foreground/60">
                            · {h.floweringWeeks} sem. floração
                          </span>
                        )}
                      </div>
                      {h.rating && h.rating > 0 && <StarRating value={h.rating} />}
                    </div>

                    {/* Notes */}
                    {h.notes && (
                      <div className="px-4 pb-3 border-t border-border/40">
                        <p className="text-xs text-muted-foreground/70 pt-2 leading-relaxed">
                          {h.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </MotionItem>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison chart */}
      {!loading && harvests.length >= 2 && (() => {
        const chartData = harvests
          .filter((h) => h.dryWeightG != null && h.dryWeightG > 0)
          .slice(0, 10)
          .map((h) => ({
            name: h.plantName.length > 12 ? h.plantName.slice(0, 11) + "…" : h.plantName,
            strain: h.strain,
            dryWeightG: h.dryWeightG ?? 0,
          }))
          .reverse(); // oldest first for chronological order

        if (chartData.length < 2) return null;

        const BAR_COLORS = [
          "hsl(var(--primary))", "#22d3ee", "#f97316", "#a855f7", "#ec4899",
          "#84cc16", "#f59e0b", "#06b6d4", "#8b5cf6", "#ef4444",
        ];

        return (
          <MotionItem>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-primary" />
                <h2 className="text-sm font-semibold">Comparativo de Colheitas</h2>
                <span className="ml-auto text-[10px] text-muted-foreground">Peso seco (g)</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    unit="g"
                  />
                  <Tooltip content={(props) => <HarvestTooltip {...props} />} />
                  <Bar dataKey="dryWeightG" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </MotionItem>
        );
      })()}

      {!loading && harvests.length < 2 && harvests.length > 0 && (
        <MotionItem>
          <div className="bg-card border border-border rounded-2xl p-4 text-center py-6">
            <BarChart2 size={24} className="mx-auto text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Adicione mais colheitas para comparar</p>
          </div>
        </MotionItem>
      )}

      <HarvestForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { refresh(); setFormOpen(false); }}
        plants={plants}
      />
    </MotionPage>
  );
}
