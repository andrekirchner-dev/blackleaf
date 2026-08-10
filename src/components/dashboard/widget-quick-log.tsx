"use client";

import { useState } from "react";
import { GROW_EVENT_TYPES } from "@/lib/event-constants";
import { EventSheet } from "@/components/calendar/event-sheet";
import type { Plant, GrowEventType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface Props {
  plants: Plant[];
  isGcalConnected: boolean;
  onSaved: () => void;
}

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function WidgetQuickLog({ plants, isGcalConnected, onSaved }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<GrowEventType>("rega");
  const [openedAt, setOpenedAt] = useState<{ date: string; time: string }>({
    date: localDateStr(),
    time: nowTimeStr(),
  });

  function openWith(type: GrowEventType) {
    setSelectedType(type);
    setOpenedAt({ date: localDateStr(), time: nowTimeStr() });
    setSheetOpen(true);
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Registrar Agora</p>
            <p className="text-[11px] text-muted-foreground">Ação não planejada — registra no horário atual</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {GROW_EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => openWith(t.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all",
                "bg-background/60 border-border/60 text-muted-foreground",
                "hover:border-primary/30 hover:bg-primary/5 hover:text-foreground active:scale-95"
              )}
            >
              <span className="text-xl leading-none">{t.emoji}</span>
              <span className="text-[9px] font-medium text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <EventSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={() => {
          onSaved();
          setSheetOpen(false);
        }}
        plants={plants}
        defaultDate={openedAt.date}
        defaultTime={openedAt.time}
        defaultType={selectedType}
        isGcalConnected={isGcalConnected}
      />
    </>
  );
}
