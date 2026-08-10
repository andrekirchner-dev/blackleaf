"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Thermometer, Droplets, Wind, Lightbulb, ArrowUp, ArrowDown, ChevronLeft } from "lucide-react";

type VPDZone = {
  label: string;
  bg: string;
  border: string;
  textColor: string;
  ideal: boolean;
};

function getVPDZone(vpd: number): VPDZone {
  if (vpd < 0.4)   return { label: "Muito baixo — risco de mofo",      bg: "bg-blue-400/10",       border: "border-blue-400/30",       textColor: "text-blue-400",   ideal: false };
  if (vpd < 0.8)   return { label: "Propagação / Muda",                 bg: "bg-emerald-300/10",    border: "border-emerald-300/30",    textColor: "text-emerald-300", ideal: false };
  if (vpd < 1.2)   return { label: "Vegetativo ideal ✓",                bg: "bg-primary/10",        border: "border-primary/30",        textColor: "text-primary",    ideal: true  };
  if (vpd < 1.6)   return { label: "Floração ideal ✓",                  bg: "bg-amber-400/10",      border: "border-amber-400/30",      textColor: "text-amber-400",  ideal: true  };
  return             { label: "Muito alto — estresse hídrico",           bg: "bg-destructive/10",    border: "border-destructive/30",    textColor: "text-destructive", ideal: false };
}

function calcVPD(temp: number, rh: number): number {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  return svp * (1 - rh / 100);
}

interface VPDAction {
  icon: React.ElementType;
  label: string;
  action: string;
  direction: "up" | "down";
}

interface VPDTip {
  summary: string;
  actions: VPDAction[];
}

function getVPDTips(vpd: number): VPDTip | null {
  if (vpd >= 0.8 && vpd <= 1.6) return null;

  if (vpd < 0.8) {
    return {
      summary: "VPD abaixo da faixa ideal — risco de mofo e doenças fúngicas.",
      actions: [
        { icon: Thermometer, label: "Temperatura", action: "Aumente a temperatura do ambiente", direction: "up" },
        { icon: Droplets,    label: "Umidade",      action: "Diminua a umidade relativa",       direction: "down" },
      ],
    };
  }
  return {
    summary: "VPD acima da faixa ideal — as plantas podem sofrer estresse hídrico.",
    actions: [
      { icon: Thermometer, label: "Temperatura", action: "Reduza a temperatura do ambiente",  direction: "down" },
      { icon: Droplets,    label: "Umidade",      action: "Aumente a umidade relativa",       direction: "up"   },
    ],
  };
}

const ZONES = [
  { range: "< 0.4 kPa",    label: "Risco de mofo",      color: "bg-blue-400"    },
  { range: "0.4–0.8 kPa",  label: "Propagação / Muda",  color: "bg-emerald-300" },
  { range: "0.8–1.2 kPa",  label: "Vegetativo ideal",   color: "bg-primary"     },
  { range: "1.2–1.6 kPa",  label: "Floração ideal",     color: "bg-amber-400"   },
  { range: "> 1.6 kPa",    label: "Estresse hídrico",   color: "bg-destructive" },
];

const FLIP_VARIANTS = {
  enterFront: { rotateY:  90, opacity: 0 },
  center:     { rotateY:   0, opacity: 1 },
  exitFront:  { rotateY: -90, opacity: 0 },
};

export default function VPDPage() {
  const [temp, setTemp] = useState("25");
  const [rh,   setRH]   = useState("60");
  const [flipped, setFlipped] = useState(false);

  const tempNum = parseFloat(temp);
  const rhNum   = parseFloat(rh);
  const isValid = !isNaN(tempNum) && !isNaN(rhNum) && tempNum >= 0 && tempNum <= 50 && rhNum >= 0 && rhNum <= 100;
  const vpd     = isValid ? calcVPD(tempNum, rhNum) : null;
  const zone    = vpd !== null ? getVPDZone(vpd) : null;
  const tips    = vpd !== null ? getVPDTips(vpd) : null;

  // Reset flip whenever values change so the card always opens on the front
  const handleTemp = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFlipped(false); setTemp(e.target.value); }, []);
  const handleRH   = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFlipped(false); setRH(e.target.value);   }, []);

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Wind size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Calculadora de VPD</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Déficit de Pressão de Vapor — o parâmetro mais importante para controle ambiental do cultivo.
            </p>
          </div>
        </div>
      </MotionItem>

      {/* Inputs */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Parâmetros Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Temp */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Thermometer size={12} className="text-amber-400" />
                Temperatura
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={50} step={0.5} value={temp}
                  onChange={handleTemp}
                  className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">°C</span>
                <input
                  type="range" min={10} max={40} step={0.5}
                  value={isNaN(tempNum) ? 25 : Math.min(40, Math.max(10, tempNum))}
                  onChange={(e) => { setFlipped(false); setTemp(e.target.value); }}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Faixa recomendada: 18–30°C</p>
            </div>

            <Separator className="bg-border/50" />

            {/* RH */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-400" />
                Umidade Relativa
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={100} step={1} value={rh}
                  onChange={handleRH}
                  className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <input
                  type="range" min={0} max={100} step={1}
                  value={isNaN(rhNum) ? 60 : Math.min(100, Math.max(0, rhNum))}
                  onChange={(e) => { setFlipped(false); setRH(e.target.value); }}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">UR ideal: 40–70% dependendo da fase</p>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {/* Result card (flip) */}
      {vpd !== null && zone !== null && (
        <MotionItem>
          <div style={{ perspective: "800px" }}>
            <AnimatePresence mode="wait" initial={false}>
              {!flipped ? (
                <motion.div
                  key="front"
                  initial={FLIP_VARIANTS.enterFront}
                  animate={FLIP_VARIANTS.center}
                  exit={FLIP_VARIANTS.exitFront}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className={cn("rounded-2xl border p-5 space-y-3", zone.bg, zone.border)}
                >
                  {/* top row */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Resultado VPD
                    </p>
                    {tips && (
                      <button
                        onClick={() => setFlipped(true)}
                        title="Ver dica de ajuste"
                        className="flex items-center gap-1.5 rounded-xl px-2 py-1 hover:bg-black/20 transition-colors"
                      >
                        <Lightbulb
                          size={18}
                          className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse"
                          fill="rgba(251,191,36,0.25)"
                        />
                        <span className="text-[11px] text-amber-400 font-medium">Ver dica</span>
                      </button>
                    )}
                  </div>

                  {/* VPD value */}
                  <div className="flex items-end gap-2">
                    <span className={cn("text-5xl font-bold font-mono leading-none", zone.textColor)}>
                      {vpd.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground mb-1">kPa</span>
                  </div>
                  <p className={cn("text-sm font-semibold", zone.textColor)}>{zone.label}</p>

                  {!tips && (
                    <p className="text-xs text-muted-foreground">VPD dentro da faixa ideal — continue assim!</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className={cn("rounded-2xl border p-5 space-y-4", zone.bg, zone.border)}
                >
                  {/* top row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFlipped(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-lg hover:bg-black/20"
                      title="Voltar"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Dica de Ajuste
                    </p>
                  </div>

                  {tips && (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tips.summary}</p>
                      <div className="space-y-2.5">
                        {tips.actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <div
                              key={action.label}
                              className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <Icon size={15} className="text-white/80" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-wide text-white/50 font-semibold leading-none mb-0.5">
                                  {action.label}
                                </p>
                                <p className="text-sm font-medium text-white/90">{action.action}</p>
                              </div>
                              {action.direction === "up"
                                ? <ArrowUp  size={18} className="text-emerald-400 shrink-0" />
                                : <ArrowDown size={18} className="text-rose-400    shrink-0" />
                              }
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </MotionItem>
      )}

      {/* Zone legend */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Zonas de VPD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ZONES.map((z) => (
              <div key={z.label} className="flex items-center gap-3">
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", z.color)} />
                <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">{z.range}</span>
                <span className="text-xs text-foreground/80">{z.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </MotionItem>

    </MotionPage>
  );
}
