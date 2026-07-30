"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Droplets, FlaskConical } from "lucide-react";
import { getEntryMeta } from "@/lib/diary-constants";
import { deleteEntry } from "@/lib/diary";
import { cn } from "@/lib/utils";
import type { DiaryEntry, Plant } from "@/lib/types";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  plant?: Plant;
  onDeleted: () => void;
}

export function DiaryEntryCard({ entry, plant, onDeleted }: DiaryEntryCardProps) {
  const meta = getEntryMeta(entry.type);

  async function handleDelete() {
    if (!confirm("Excluir este registro?")) return;
    await deleteEntry(entry.id);
    onDeleted();
  }

  const dateStr = (() => {
    try {
      return format(parseISO(entry.date), "dd MMM, HH:mm", { locale: ptBR });
    } catch {
      return entry.date;
    }
  })();

  return (
    <div className="flex gap-3 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0",
          meta.color
        )}>
          {meta.emoji}
        </div>
        <div className="w-px flex-1 bg-border mt-2 mb-0 min-h-[16px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", meta.color)}>
                  {meta.label}
                </span>
                {plant && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {plant.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{dateStr}</p>
            </div>
            <button
              onClick={handleDelete}
              className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Metrics */}
          {(entry.ph || entry.ec || entry.waterAmount) && (
            <div className="flex flex-wrap gap-3 py-2 border-t border-border">
              {entry.ph && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Droplets size={11} className="text-blue-400" />
                  <span className="text-muted-foreground">pH</span>
                  <span className="font-semibold text-foreground">{entry.ph}</span>
                </div>
              )}
              {entry.ec && (
                <div className="flex items-center gap-1.5 text-xs">
                  <FlaskConical size={11} className="text-purple-400" />
                  <span className="text-muted-foreground">EC</span>
                  <span className="font-semibold text-foreground">{entry.ec} mS/cm</span>
                </div>
              )}
              {entry.waterAmount && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Droplets size={11} className="text-cyan-400" />
                  <span className="font-semibold text-foreground">{entry.waterAmount} mL</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <p className="text-sm text-foreground/80 leading-relaxed">{entry.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
