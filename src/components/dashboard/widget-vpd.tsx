"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wind, ExternalLink, Lightbulb, ArrowUp, ArrowDown, ChevronUp, Thermometer, Droplets } from "lucide-react";

function calcVPD(temp: number, rh: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) * (1 - rh / 100);
}

function getZone(vpd: number) {
  if (vpd < 0.4) return { label: "Muito baixo",    color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30"    };
  if (vpd < 0.8) return { label: "Propagação",     color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30" };
  if (vpd < 1.2) return { label: "Vegetativo ✓",   color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30"     };
  if (vpd < 1.6) return { label: "Floração ✓",     color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30"   };
  return               { label: "Muito alto",       color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"     };
}

function getPanel(vpd: number) {
  const ideal = vpd >= 0.8 && vpd <= 1.6;
  if (ideal) return { ideal: true, summary: "VPD dentro da faixa ideal.", actions: [] as { Icon: React.ElementType; text: string; up: boolean }[] };
  if (vpd < 0.8) return { ideal: false, summary: "VPD baixo — risco de mofo.", actions: [
    { Icon: Thermometer, text: "Aumente a temperatura",   up: true  },
    { Icon: Droplets,    text: "Diminua a umidade",       up: false },
  ]};
  return { ideal: false, summary: "VPD alto — estresse hídrico.", actions: [
    { Icon: Thermometer, text: "Reduza a temperatura",        up: false },
    { Icon: Droplets,    text: "Aumente a umidade relativa",  up: true  },
  ]};
}

export function WidgetVPD() {
  const [temp, setTemp] = useState(25);
  const [rh,   setRH]   = useState(60);
  const [panelOpen, setPanelOpen] = useState(false);

  const vpd   = calcVPD(temp, rh);
  const zone  = getZone(vpd);
  const panel = getPanel(vpd);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wind size={14} className="text-primary" /> VPD
        </h3>
        <Link href="/tools/vpd" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          Calculadora <ExternalLink size={10} />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Result row + lightbulb */}
        <div className={cn("rounded-xl border p-3 flex items-center gap-3", zone.bg, zone.border)}>
          <span className={cn("text-4xl font-bold font-mono leading-none shrink-0", zone.color)}>
            {vpd.toFixed(2)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">kPa</p>
            <p className={cn("text-xs font-medium mt-0.5", zone.color)}>{zone.label}</p>
          </div>

          {/* Lightbulb — SEMPRE visível */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-black/10 active:bg-black/20 transition-colors"
          >
            <Lightbulb
              size={22}
              strokeWidth={1.5}
              className={panel.ideal ? "text-muted-foreground/30" : "text-amber-400"}
              style={panel.ideal ? {} : {
                filter: "drop-shadow(0 0 8px rgba(251,191,36,1))",
                fill: "rgba(251,191,36,0.35)",
              }}
            />
            <span className={cn("text-[9px] font-semibold leading-none", panel.ideal ? "text-muted-foreground/40" : "text-amber-400")}>
              {panelOpen ? "×" : panel.ideal ? "ok" : "dica"}
            </span>
          </button>
        </div>

        {/* Panel */}
        {panelOpen && (
          <div className={cn(
            "rounded-xl border p-3 space-y-2",
            panel.ideal ? "border-primary/20 bg-primary/5" : "border-amber-400/20 bg-amber-400/5"
          )}>
            <div className="flex items-center justify-between">
              <p className={cn("text-[10px] font-semibold uppercase tracking-wide", panel.ideal ? "text-primary" : "text-amber-400")}>
                {panel.ideal ? "✓ Ideal" : "⚠ Ajuste"}
              </p>
              <button onClick={() => setPanelOpen(false)}>
                <ChevronUp size={12} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">{panel.summary}</p>
            {panel.actions.map((a) => (
              <div key={a.text} className="flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-2">
                <a.Icon size={13} className="text-foreground/60 shrink-0" />
                <p className="text-xs font-medium text-foreground flex-1">{a.text}</p>
                {a.up ? <ArrowUp size={14} className="text-emerald-400 shrink-0" /> : <ArrowDown size={14} className="text-rose-400 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Temperatura</span>
              <span className="font-mono font-medium">{temp}°C</span>
            </div>
            <input type="range" min={10} max={40} step={0.5} value={temp}
              onChange={(e) => { setPanelOpen(false); setTemp(parseFloat(e.target.value)); }}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Umidade Relativa</span>
              <span className="font-mono font-medium">{rh}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={rh}
              onChange={(e) => { setPanelOpen(false); setRH(parseInt(e.target.value)); }}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
