"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Wind, ExternalLink, Lightbulb, ArrowUp, ArrowDown, ChevronLeft, Thermometer, Droplets } from "lucide-react";

function calcVPD(temp: number, rh: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) * (1 - rh / 100);
}

function getZone(vpd: number) {
  if (vpd < 0.4) return { label: "Muito baixo — risco de mofo", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30",    ideal: false };
  if (vpd < 0.8) return { label: "Propagação / Muda",           color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30", ideal: false };
  if (vpd < 1.2) return { label: "Vegetativo ideal ✓",          color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30",     ideal: true  };
  if (vpd < 1.6) return { label: "Floração ideal ✓",            color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30",   ideal: true  };
  return               { label: "Muito alto — estresse hídrico", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", ideal: false };
}

function getTips(vpd: number) {
  if (vpd >= 0.8 && vpd <= 1.6) return null;
  if (vpd < 0.8) return {
    summary: "VPD abaixo do ideal — risco de mofo e doenças fúngicas.",
    actions: [
      { icon: Thermometer, label: "Temperatura", action: "Aumente a temperatura",  direction: "up"   as const },
      { icon: Droplets,    label: "Umidade",     action: "Diminua a umidade relativa", direction: "down" as const },
    ],
  };
  return {
    summary: "VPD acima do ideal — as plantas podem sofrer estresse hídrico.",
    actions: [
      { icon: Thermometer, label: "Temperatura", action: "Reduza a temperatura",       direction: "down" as const },
      { icon: Droplets,    label: "Umidade",     action: "Aumente a umidade relativa", direction: "up"   as const },
    ],
  };
}

export function WidgetVPD() {
  const [temp, setTemp] = useState(25);
  const [rh,   setRH]   = useState(60);
  const [flipped, setFlipped] = useState(false);

  const vpd  = calcVPD(temp, rh);
  const zone = getZone(vpd);
  const tips = getTips(vpd);

  function handleTempChange(v: number) { setFlipped(false); setTemp(v); }
  function handleRHChange(v: number)   { setFlipped(false); setRH(v);   }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
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
        {/* Flip card result */}
        <div style={{ perspective: "600px" }}>
          <AnimatePresence mode="wait" initial={false}>
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0,  opacity: 1 }}
                exit={{   rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn("rounded-xl border p-3 flex items-center gap-3", zone.bg, zone.border)}
              >
                <span className={cn("text-4xl font-bold font-mono leading-none shrink-0", zone.color)}>
                  {vpd.toFixed(2)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">kPa</p>
                  <p className={cn("text-xs font-medium mt-0.5 truncate", zone.color)}>{zone.label}</p>
                </div>
                {tips && (
                  <button
                    onClick={() => setFlipped(true)}
                    title="Ver dica de ajuste"
                    className="shrink-0 flex flex-col items-center gap-0.5"
                  >
                    <Lightbulb
                      size={20}
                      className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse"
                      fill="rgba(251,191,36,0.25)"
                    />
                    <span className="text-[9px] text-amber-400 font-medium leading-none">Dica</span>
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0,  opacity: 1 }}
                exit={{   rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn("rounded-xl border p-3 space-y-2", zone.bg, zone.border)}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <button
                    onClick={() => setFlipped(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Dica de Ajuste
                  </p>
                </div>
                {tips && (
                  <>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tips.summary}</p>
                    {tips.actions.map((a) => {
                      const Icon = a.icon;
                      return (
                        <div key={a.label} className="flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-2">
                          <Icon size={13} className="text-white/70 shrink-0" />
                          <p className="text-xs font-medium text-white/90 flex-1">{a.action}</p>
                          {a.direction === "up"
                            ? <ArrowUp   size={14} className="text-emerald-400 shrink-0" />
                            : <ArrowDown size={14} className="text-rose-400    shrink-0" />
                          }
                        </div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Temperatura</span>
              <span className="font-mono text-foreground font-medium">{temp}°C</span>
            </div>
            <input
              type="range" min={10} max={40} step={0.5} value={temp}
              onChange={(e) => handleTempChange(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Umidade Relativa</span>
              <span className="font-mono text-foreground font-medium">{rh}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={rh}
              onChange={(e) => handleRHChange(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
