"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen } from "lucide-react";
import { getEntryMeta } from "@/lib/diary-constants";
import type { DiaryEntry, Plant } from "@/lib/types";

interface Props {
  entries: DiaryEntry[];
  plants: Plant[];
}

export function WidgetDiary({ entries, plants }: Props) {
  const plantMap = Object.fromEntries(plants.map((p) => [p.id, p]));
  const recent = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen size={14} className="text-accent" />
          Diário Recente
        </h3>
        <Link href="/diary" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver tudo →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma anotação ainda.</p>
          <Link href="/diary" className="text-xs text-primary mt-1 block hover:underline">
            Adicionar →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {recent.map((entry) => {
            const meta = getEntryMeta(entry.type);
            const plant = plantMap[entry.plantId];
            let dateStr = "";
            try {
              dateStr = format(new Date(entry.date), "dd/MM", { locale: ptBR });
            } catch {
              dateStr = entry.date.slice(5, 10);
            }

            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-base leading-none mt-0.5 shrink-0">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-foreground">{meta.label}</span>
                    {plant && (
                      <span className="text-[11px] text-muted-foreground">· {plant.name}</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1 leading-relaxed">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/40 shrink-0 mt-0.5">{dateStr}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
