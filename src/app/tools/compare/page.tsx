"use client";

import { useState } from "react";
import { useHarvest } from "@/hooks/use-harvest";
import type { HarvestLog } from "@/lib/types";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { BarChart2, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const TRICHOME_LABELS: Record<string, string> = {
  transparente: "Transparente",
  leitoso: "Leitoso",
  ambar_50: "50% âmbar",
  ambar_100: "100% âmbar",
};

function Stars({ n }: { n?: number }) {
  if (!n) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < n ? "text-accent fill-accent" : "text-muted-foreground/30"}
        />
      ))}
    </span>
  );
}

function yieldPercent(wet?: number, dry?: number): string {
  if (!wet || !dry) return "—";
  return `${((dry / wet) * 100).toFixed(1)}%`;
}

function winner(a?: number, b?: number): "a" | "b" | null {
  if (a == null || b == null) return null;
  if (a > b) return "a";
  if (b > a) return "b";
  return null;
}

function winnerRating(a?: number, b?: number): "a" | "b" | null {
  return winner(a, b);
}

interface RowProps {
  label: string;
  valA: React.ReactNode;
  valB: React.ReactNode;
  winSide?: "a" | "b" | null;
}

function CompareRow({ label, valA, valB, winSide }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 py-2.5 border-b border-border/40 items-center">
      <div className={cn("text-sm", winSide === "a" ? "font-semibold text-primary" : "text-foreground")}>
        {valA}
        {winSide === "a" && <Trophy size={11} className="inline ml-1 text-primary" />}
      </div>
      <span className="text-[10px] text-muted-foreground/60 text-center whitespace-nowrap px-1">{label}</span>
      <div className={cn("text-sm text-right", winSide === "b" ? "font-semibold text-primary" : "text-foreground")}>
        {winSide === "b" && <Trophy size={11} className="inline mr-1 text-primary" />}
        {valB}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { harvests } = useHarvest();
  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");

  const harvestA = harvests.find((h) => h.id === idA) ?? null;
  const harvestB = harvests.find((h) => h.id === idB) ?? null;

  const yieldA = harvestA?.wetWeightG && harvestA?.dryWeightG
    ? (harvestA.dryWeightG / harvestA.wetWeightG) * 100
    : undefined;
  const yieldB = harvestB?.wetWeightG && harvestB?.dryWeightG
    ? (harvestB.dryWeightG / harvestB.wetWeightG) * 100
    : undefined;

  return (
    <MotionPage>
      <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
        <MotionItem>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart2 size={22} className="text-primary" />
              Comparativo de Ciclos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Compare resultados entre colheitas</p>
          </div>
        </MotionItem>

        {harvests.length < 2 ? (
          <MotionItem>
            <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
              <BarChart2 size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium">Você precisa de pelo menos 2 colheitas registradas para comparar</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                Registre mais colheitas em <span className="text-primary">/harvest</span>
              </p>
            </div>
          </MotionItem>
        ) : (
          <>
            <MotionItem>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ciclo A</p>
                  <select
                    value={idA}
                    onChange={(e) => setIdA(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Selecionar...</option>
                    {harvests.map((h) => (
                      <option key={h.id} value={h.id} disabled={h.id === idB}>
                        {h.plantName} — {h.harvestDate}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ciclo B</p>
                  <select
                    value={idB}
                    onChange={(e) => setIdB(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Selecionar...</option>
                    {harvests.map((h) => (
                      <option key={h.id} value={h.id} disabled={h.id === idA}>
                        {h.plantName} — {h.harvestDate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </MotionItem>

            {harvestA && harvestB && (
              <MotionItem>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-4 py-3 border-b border-border bg-muted/20">
                    <p className="text-sm font-bold text-foreground">{harvestA.plantName}</p>
                    <span className="text-[10px] text-muted-foreground/40 self-center">vs</span>
                    <p className="text-sm font-bold text-foreground text-right">{harvestB.plantName}</p>
                  </div>

                  <div className="px-4 divide-y divide-border/20">
                    <CompareRow
                      label="Strain"
                      valA={<span className="text-xs">{harvestA.strain}</span>}
                      valB={<span className="text-xs">{harvestB.strain}</span>}
                    />
                    <CompareRow
                      label="Data"
                      valA={<span className="text-xs">{harvestA.harvestDate}</span>}
                      valB={<span className="text-xs">{harvestB.harvestDate}</span>}
                    />
                    <CompareRow
                      label="Peso úmido"
                      valA={harvestA.wetWeightG ? `${harvestA.wetWeightG}g` : "—"}
                      valB={harvestB.wetWeightG ? `${harvestB.wetWeightG}g` : "—"}
                      winSide={winner(harvestA.wetWeightG, harvestB.wetWeightG)}
                    />
                    <CompareRow
                      label="Peso seco"
                      valA={harvestA.dryWeightG ? `${harvestA.dryWeightG}g` : "—"}
                      valB={harvestB.dryWeightG ? `${harvestB.dryWeightG}g` : "—"}
                      winSide={winner(harvestA.dryWeightG, harvestB.dryWeightG)}
                    />
                    <CompareRow
                      label="Peso curado"
                      valA={harvestA.curedWeightG ? `${harvestA.curedWeightG}g` : "—"}
                      valB={harvestB.curedWeightG ? `${harvestB.curedWeightG}g` : "—"}
                      winSide={winner(harvestA.curedWeightG, harvestB.curedWeightG)}
                    />
                    <CompareRow
                      label="Rendimento %"
                      valA={yieldPercent(harvestA.wetWeightG, harvestA.dryWeightG)}
                      valB={yieldPercent(harvestB.wetWeightG, harvestB.dryWeightG)}
                      winSide={winner(yieldA, yieldB)}
                    />
                    <CompareRow
                      label="Semanas floração"
                      valA={harvestA.floweringWeeks ? `${harvestA.floweringWeeks}sem` : "—"}
                      valB={harvestB.floweringWeeks ? `${harvestB.floweringWeeks}sem` : "—"}
                    />
                    <CompareRow
                      label="Avaliação"
                      valA={<Stars n={harvestA.rating} />}
                      valB={<Stars n={harvestB.rating} />}
                      winSide={winnerRating(harvestA.rating, harvestB.rating)}
                    />
                    <CompareRow
                      label="Tricomas"
                      valA={<span className="text-xs">{harvestA.trichomeStage ? TRICHOME_LABELS[harvestA.trichomeStage] : "—"}</span>}
                      valB={<span className="text-xs">{harvestB.trichomeStage ? TRICHOME_LABELS[harvestB.trichomeStage] : "—"}</span>}
                    />
                    <div className="py-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 mb-1">Notas A</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{harvestA.notes || "—"}</p>
                    </div>
                    <div className="py-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60 mb-1">Notas B</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{harvestB.notes || "—"}</p>
                    </div>
                  </div>
                </div>
              </MotionItem>
            )}
          </>
        )}
      </div>
    </MotionPage>
  );
}
