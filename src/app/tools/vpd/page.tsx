"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Thermometer, Droplets, Wind, Lightbulb, ArrowUp, ArrowDown, ChevronUp } from "lucide-react";

function calcVPD(temp: number, rh: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)) * (1 - rh / 100);
}

function getZone(vpd: number) {
  if (vpd < 0.4)  return { label: "Muito baixo — risco de mofo",      bg: "bg-blue-400/10",    border: "border-blue-400/30",    text: "text-blue-400",    ideal: false };
  if (vpd < 0.8)  return { label: "Propagação / Muda",                 bg: "bg-emerald-300/10", border: "border-emerald-300/30", text: "text-emerald-300", ideal: false };
  if (vpd < 1.2)  return { label: "Vegetativo ideal",                  bg: "bg-primary/10",     border: "border-primary/30",     text: "text-primary",     ideal: true  };
  if (vpd < 1.6)  return { label: "Floração ideal",                    bg: "bg-amber-400/10",   border: "border-amber-400/30",   text: "text-amber-400",   ideal: true  };
  return                  { label: "Muito alto — estresse hídrico",     bg: "bg-red-500/10",     border: "border-red-500/30",     text: "text-red-400",     ideal: false };
}

function getPanel(vpd: number) {
  if (vpd >= 0.8 && vpd <= 1.6) {
    return { ideal: true, summary: "VPD dentro da faixa ideal para cultivo.", actions: [] as { Icon: React.ElementType; label: string; text: string; up: boolean }[] };
  }
  if (vpd < 0.8) return {
    ideal: false,
    summary: "VPD abaixo da faixa ideal — risco de mofo e doenças fúngicas.",
    actions: [
      { Icon: Thermometer, label: "Temperatura", text: "Aumente a temperatura do ambiente", up: true  },
      { Icon: Droplets,    label: "Umidade",     text: "Diminua a umidade relativa",        up: false },
    ],
  };
  return {
    ideal: false,
    summary: "VPD acima da faixa ideal — as plantas podem sofrer estresse hídrico.",
    actions: [
      { Icon: Thermometer, label: "Temperatura", text: "Reduza a temperatura do ambiente",  up: false },
      { Icon: Droplets,    label: "Umidade",     text: "Aumente a umidade relativa",        up: true  },
    ],
  };
}

const ZONES = [
  { range: "< 0.4 kPa",   label: "Risco de mofo",     color: "bg-blue-400"    },
  { range: "0.4–0.8 kPa", label: "Propagação / Muda", color: "bg-emerald-300" },
  { range: "0.8–1.2 kPa", label: "Vegetativo ideal",  color: "bg-primary"     },
  { range: "1.2–1.6 kPa", label: "Floração ideal",    color: "bg-amber-400"   },
  { range: "> 1.6 kPa",   label: "Estresse hídrico",  color: "bg-red-500"     },
];

export default function VPDPage() {
  const [temp, setTemp] = useState("25");
  const [rh,   setRH]   = useState("60");
  const [panelOpen, setPanelOpen] = useState(false);

  const tempNum = parseFloat(temp);
  const rhNum   = parseFloat(rh);
  const isValid = !isNaN(tempNum) && !isNaN(rhNum) && tempNum >= 0 && tempNum <= 50 && rhNum >= 0 && rhNum <= 100;
  const vpd   = isValid ? calcVPD(tempNum, rhNum) : null;
  const zone  = vpd !== null ? getZone(vpd) : null;
  const panel = vpd !== null ? getPanel(vpd) : null;

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Wind size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Calculadora de VPD</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Déficit de Pressão de Vapor — o parâmetro mais importante para controle ambiental.
            </p>
          </div>
        </div>
      </MotionItem>

      {/* Inputs */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Parâmetros Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Thermometer size={12} className="text-amber-400" /> Temperatura
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={50} step={0.5} value={temp}
                  onChange={(e) => { setPanelOpen(false); setTemp(e.target.value); }}
                  className="bg-muted/20 border-border text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">°C</span>
                <input type="range" min={10} max={40} step={0.5}
                  value={isNaN(tempNum) ? 25 : Math.min(40, Math.max(10, tempNum))}
                  onChange={(e) => { setPanelOpen(false); setTemp(e.target.value); }}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-400" /> Umidade Relativa
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={100} step={1} value={rh}
                  onChange={(e) => { setPanelOpen(false); setRH(e.target.value); }}
                  className="bg-muted/20 border-border text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <input type="range" min={0} max={100} step={1}
                  value={isNaN(rhNum) ? 60 : Math.min(100, Math.max(0, rhNum))}
                  onChange={(e) => { setPanelOpen(false); setRH(e.target.value); }}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {/* Result + lightbulb — sempre visível quando há valores */}
      {vpd !== null && zone !== null && panel !== null && (
        <MotionItem>
          <div className={cn("rounded-2xl border p-5 space-y-4", zone.bg, zone.border)}>
            {/* VPD value row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Resultado VPD
                </p>
                <div className="flex items-end gap-2">
                  <span className={cn("text-5xl font-bold font-mono leading-none", zone.text)}>
                    {vpd.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">kPa</span>
                </div>
                <p className={cn("text-sm font-semibold mt-2", zone.text)}>{zone.label}</p>
              </div>

              {/* Lightbulb — SEMPRE visível */}
              <button
                onClick={() => setPanelOpen((o) => !o)}
                className="flex flex-col items-center gap-1 shrink-0 mt-1 p-2 rounded-xl hover:bg-black/10 active:bg-black/20 transition-colors"
              >
                <Lightbulb
                  size={32}
                  strokeWidth={1.5}
                  className={panel.ideal ? "text-muted-foreground/40" : "text-amber-400"}
                  style={panel.ideal ? {} : {
                    filter: "drop-shadow(0 0 10px rgba(251,191,36,1))",
                    fill: "rgba(251,191,36,0.35)",
                  }}
                />
                <span className={cn("text-[10px] font-semibold", panel.ideal ? "text-muted-foreground/50" : "text-amber-400")}>
                  {panelOpen ? "Fechar" : panel.ideal ? "Info" : "Dica!"}
                </span>
              </button>
            </div>

            {/* Panel — aparece ao clicar na lâmpada */}
            {panelOpen && (
              <div className={cn(
                "rounded-xl border p-3 space-y-2",
                panel.ideal
                  ? "border-primary/20 bg-primary/5"
                  : "border-amber-400/20 bg-amber-400/5"
              )}>
                <div className="flex items-center justify-between">
                  <p className={cn("text-xs font-semibold", panel.ideal ? "text-primary" : "text-amber-400")}>
                    {panel.ideal ? "✓ VPD ideal" : "⚠ Ajuste necessário"}
                  </p>
                  <button onClick={() => setPanelOpen(false)}>
                    <ChevronUp size={14} className="text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{panel.summary}</p>
                {panel.actions.map((a) => (
                  <div key={a.label} className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-2.5">
                    <a.Icon size={15} className="text-foreground/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{a.label}</p>
                      <p className="text-sm font-medium text-foreground">{a.text}</p>
                    </div>
                    {a.up
                      ? <ArrowUp   size={18} className="text-emerald-400 shrink-0" />
                      : <ArrowDown size={18} className="text-rose-400    shrink-0" />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        </MotionItem>
      )}

      {/* Zone legend */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Zonas de VPD</CardTitle>
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
