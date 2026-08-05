"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteFertilizer } from "@/lib/fertilizers";
import type { Fertilizer, FertilizerType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<FertilizerType, { label: string; emoji: string; color: string }> = {
  organico:       { label: "Orgânico",       emoji: "🌿", color: "bg-green-500/10 border-green-500/20 text-green-400" },
  mineral:        { label: "Mineral",        emoji: "⚗️",  color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  organomineral:  { label: "Organomineral",  emoji: "🔬", color: "bg-teal-500/10 border-teal-500/20 text-teal-400" },
  knf:            { label: "KNF",            emoji: "🍃", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  bioestimulante: { label: "Bioestimulante", emoji: "⚡", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  pk_boost:       { label: "PK Boost",       emoji: "💥", color: "bg-red-500/10 border-red-500/20 text-red-400" },
  cal_mag:        { label: "Cal-Mag",        emoji: "🦴", color: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
  radicular:      { label: "Radicular",      emoji: "🌱", color: "bg-lime-500/10 border-lime-500/20 text-lime-400" },
  foliar:         { label: "Foliar",         emoji: "🍀", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
};

const DOSE_STAGES = [
  { key: "muda" as const, label: "Muda" },
  { key: "vegetativo" as const, label: "Veg" },
  { key: "floracao_inicio" as const, label: "Flor. início" },
  { key: "floracao_meio" as const, label: "Flor. meio" },
  { key: "floracao_fim" as const, label: "Flor. fim" },
];

interface FertilizerCardProps {
  fertilizer: Fertilizer;
  onEdit: () => void;
  onDeleted: () => void;
}

export function FertilizerCard({ fertilizer, onEdit, onDeleted }: FertilizerCardProps) {
  const [deleting, setDeleting] = useState(false);
  const meta = TYPE_META[fertilizer.type];

  const hasNpk = fertilizer.npkN != null || fertilizer.npkP != null || fertilizer.npkK != null;
  const hasDoses = DOSE_STAGES.some((s) => fertilizer.doses?.[s.key] != null);

  async function handleDelete() {
    if (!confirm(`Excluir "${fertilizer.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteFertilizer(fertilizer.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-foreground truncate">
              {fertilizer.name}
            </span>
            {fertilizer.brand && (
              <span className="text-xs text-muted-foreground">{fertilizer.brand}</span>
            )}
          </div>
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border mt-1",
            meta.color
          )}>
            {meta.emoji} {meta.label}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* NPK */}
      {hasNpk && (
        <div className="flex gap-2">
          {[
            { label: "N", value: fertilizer.npkN },
            { label: "P", value: fertilizer.npkP },
            { label: "K", value: fertilizer.npkK },
          ].map(({ label, value }) => (
            value != null && (
              <div key={label} className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
                <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                <span className="text-xs font-bold text-foreground">{value}</span>
              </div>
            )
          ))}
          {fertilizer.secondaryNutrients && (
            <div className="flex items-center bg-muted/50 rounded-lg px-2 py-1">
              <span className="text-[10px] text-muted-foreground">{fertilizer.secondaryNutrients}</span>
            </div>
          )}
        </div>
      )}

      {/* Doses */}
      {hasDoses && (
        <div className="grid grid-cols-5 gap-1 border-t border-border pt-3">
          {DOSE_STAGES.map((s) => {
            const dose = fertilizer.doses?.[s.key];
            return (
              <div key={s.key} className="text-center">
                <p className="text-[9px] text-muted-foreground leading-tight mb-1">{s.label}</p>
                <p className={cn(
                  "text-xs font-semibold",
                  dose != null ? "text-primary" : "text-muted-foreground/30"
                )}>
                  {dose != null ? `${dose}` : "—"}
                </p>
                {dose != null && (
                  <p className="text-[9px] text-muted-foreground">mL/L</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EC contribution */}
      {fertilizer.ecPerMl != null && (
        <p className="text-[11px] text-muted-foreground">
          EC: <span className="text-foreground font-medium">+{fertilizer.ecPerMl} mS/cm</span> por mL/L
        </p>
      )}

      {/* Application frequency */}
      {fertilizer.applicationFrequency && (
        <p className="text-[11px] text-muted-foreground italic">{fertilizer.applicationFrequency}</p>
      )}
    </div>
  );
}
