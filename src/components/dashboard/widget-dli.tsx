"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sun, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

function calcDLI(ppfd: number, hours: number): number {
  return (ppfd * hours * 3600) / 1_000_000;
}

function getZone(dli: number) {
  if (dli < 15) return { label: "Insuficiente para cannabis", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
  if (dli < 25) return { label: "Adequado para vegetativo", color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30" };
  if (dli < 40) return { label: "Ideal para floração", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
  return { label: "Excessivo — risco de foto-estresse", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
}

export function WidgetDLI() {
  const [ppfd, setPpfd] = useState("600");
  const [hours, setHours] = useState("18");

  const ppfdNum = parseFloat(ppfd) || 0;
  const hoursNum = parseFloat(hours) || 0;
  const dli = ppfdNum > 0 && hoursNum > 0 ? calcDLI(ppfdNum, hoursNum) : null;
  const zone = dli !== null ? getZone(dli) : null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sun size={14} className="text-amber-400" />
          DLI
        </h3>
        <Link
          href="/tools/dli"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Calculadora completa
          <ExternalLink size={10} />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">PPFD (µmol/m²/s)</p>
            <Input
              type="number"
              value={ppfd}
              onChange={(e) => setPpfd(e.target.value)}
              className="h-9 text-sm bg-background border-border text-center font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">Horas de luz/dia</p>
            <Input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="h-9 text-sm bg-background border-border text-center font-mono"
            />
          </div>
        </div>

        {dli !== null && zone !== null && (
          <div className={cn("rounded-xl border p-3 flex items-center gap-3", zone.bg, zone.border)}>
            <span className={cn("text-4xl font-bold font-mono leading-none", zone.color)}>
              {dli.toFixed(1)}
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">mol/m²/dia</p>
              <p className={cn("text-xs font-medium mt-0.5", zone.color)}>{zone.label}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
