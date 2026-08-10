"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wind, ExternalLink, Lightbulb, ArrowUp, ArrowDown, X, Thermometer, Droplets } from "lucide-react";

function calcVPD(temp: number, rh: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) * (1 - rh / 100);
}

function getZone(vpd: number) {
  if (vpd < 0.4) return { label: "Muito baixo — risco de mofo", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30"    };
  if (vpd < 0.8) return { label: "Propagação / Muda",           color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30" };
  if (vpd < 1.2) return { label: "✓ Vegetativo ideal",          color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30"     };
  if (vpd < 1.6) return { label: "✓ Floração ideal",            color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30"   };
  return               { label: "Muito alto — estresse hídrico", color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"     };
}

function getTips(vpd: number) {
  if (vpd >= 0.8 && vpd <= 1.6) return null;
  if (vpd < 0.8) return {
    summary: "VPD abaixo do ideal — risco de mofo.",
    actions: [
      { Icon: Thermometer, label: "Temperatura", text: "Aumente a temperatura",   up: true  },
      { Icon: Droplets,    label: "Umidade",     text: "Diminua a umidade",       up: false },
    ],
  };
  return {
    summary: "VPD acima do ideal — estresse hídrico.",
    actions: [
      { Icon: Thermometer, label: "Temperatura", text: "Reduza a temperatura",        up: false },
      { Icon: Droplets,    label: "Umidade",     text: "Aumente a umidade relativa",  up: true  },
    ],
  };
}

export function WidgetVPD() {
  const [temp, setTemp] = useState(25);
  const [rh,   setRH]   = useState(60);
  const [tipOpen, setTipOpen] = useState(false);

  const vpd  = calcVPD(temp, rh);
  const zone = getZone(vpd);
  const tips = getTips(vpd);

  function onTemp(v: number) { setTipOpen(false); setTemp(v); }
  function onRH(v: number)   { setTipOpen(false); setRH(v);   }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wind size={14} className="text-primary" />
          VPD
        </h3>
        <Link href="/tools/vpd" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          Calculadora completa <ExternalLink size={10} />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Result row */}
        <div className={cn("rounded-xl border p-3 flex items-center gap-3", zone.bg, zone.border)}>
          <span className={cn("text-4xl font-bold font-mono leading-none shrink-0", zone.color)}>
            {vpd.toFixed(2)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">kPa</p>
            <p className={cn("text-xs font-medium mt-0.5 truncate", zone.color)}>{zone.label}</p>
          </div>
          {tips && (
            <button
              onClick={() => setTipOpen((o) => !o)}
              className="shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            >
              <Lightbulb
                size={20}
                strokeWidth={1.5}
                className="text-amber-400"
                style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.9))", fill: "rgba(251,191,36,0.3)" }}
              />
              <span className="text-[9px] text-amber-400 font-semibold leading-none">
                {tipOpen ? "×" : "Dica"}
              </span>
            </button>
          )}
        </div>

        {/* Tip panel */}
        {tips && tipOpen && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">Dica de ajuste</p>
              <button onClick={() => setTipOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">{tips.summary}</p>
            {tips.actions.map((a) => (
              <div key={a.label} className="flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-2">
                <a.Icon size={13} className="text-foreground/60 shrink-0" />
                <p className="text-xs font-medium text-foreground flex-1">{a.text}</p>
                {a.up
                  ? <ArrowUp   size={14} className="text-emerald-400 shrink-0" />
                  : <ArrowDown size={14} className="text-rose-400    shrink-0" />
                }
              </div>
            ))}
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Temperatura</span>
              <span className="font-mono text-foreground font-medium">{temp}°C</span>
            </div>
            <input type="range" min={10} max={40} step={0.5} value={temp}
              onChange={(e) => onTemp(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Umidade Relativa</span>
              <span className="font-mono text-foreground font-medium">{rh}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={rh}
              onChange={(e) => onRH(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
