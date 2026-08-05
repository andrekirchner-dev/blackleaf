"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wind, ExternalLink } from "lucide-react";

function calcVPD(temp: number, rh: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) * (1 - rh / 100);
}

function getZone(vpd: number) {
  if (vpd < 0.4) return { label: "Muito baixo — risco de mofo", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" };
  if (vpd < 0.8) return { label: "Propagação / Muda", color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30" };
  if (vpd < 1.2) return { label: "Vegetativo ideal", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
  if (vpd < 1.6) return { label: "Floração ideal", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
  return { label: "Muito alto — estresse hídrico", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
}

export function WidgetVPD() {
  const [temp, setTemp] = useState(25);
  const [rh, setRH] = useState(60);

  const vpd = calcVPD(temp, rh);
  const zone = getZone(vpd);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wind size={14} className="text-primary" />
          VPD
        </h3>
        <Link
          href="/tools/vpd"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Calculadora completa
          <ExternalLink size={10} />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Result */}
        <div className={cn("rounded-xl border p-3 flex items-center gap-3", zone.bg, zone.border)}>
          <span className={cn("text-4xl font-bold font-mono leading-none", zone.color)}>
            {vpd.toFixed(2)}
          </span>
          <div>
            <p className="text-[11px] text-muted-foreground">kPa</p>
            <p className={cn("text-xs font-medium mt-0.5", zone.color)}>{zone.label}</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Temperatura</span>
              <span className="font-mono text-foreground font-medium">{temp}°C</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={0.5}
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Umidade Relativa</span>
              <span className="font-mono text-foreground font-medium">{rh}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={rh}
              onChange={(e) => setRH(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
