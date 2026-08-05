"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Zap, LayoutGrid, Info } from "lucide-react";

type DLIZone = {
  label: string;
  bg: string;
  border: string;
  textColor: string;
};

function getDLIZone(dli: number): DLIZone {
  if (dli < 15) {
    return {
      label: "Insuficiente para cannabis",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      textColor: "text-destructive",
    };
  } else if (dli < 25) {
    return {
      label: "Adequado para veg",
      bg: "bg-emerald-300/10",
      border: "border-emerald-300/30",
      textColor: "text-emerald-300",
    };
  } else if (dli < 40) {
    return {
      label: "Ideal para flora",
      bg: "bg-primary/10",
      border: "border-primary/30",
      textColor: "text-primary",
    };
  } else {
    return {
      label: "Excessivo — risco de foto-estresse",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
      textColor: "text-amber-400",
    };
  }
}

type Mode = "ppfd" | "watts";

const DLI_ZONES = [
  { range: "< 15", label: "Insuficiente para cannabis", color: "bg-destructive" },
  { range: "15–25", label: "Adequado para veg", color: "bg-emerald-300" },
  { range: "25–40", label: "Ideal para flora", color: "bg-primary" },
  { range: "> 40", label: "Excessivo — foto-estresse", color: "bg-amber-400" },
];

export default function DLIPage() {
  const [mode, setMode] = useState<Mode>("ppfd");

  // Mode: PPFD
  const [ppfd, setPpfd] = useState<string>("600");
  const [hours, setHours] = useState<string>("18");

  // Mode: Watts
  const [watts, setWatts] = useState<string>("600");
  const [area, setArea] = useState<string>("1.2");
  const [efficiency, setEfficiency] = useState<string>("2.5");
  const [hoursW, setHoursW] = useState<string>("18");

  const ppfdNum = parseFloat(ppfd);
  const hoursNum = parseFloat(hours);
  const wattsNum = parseFloat(watts);
  const areaNum = parseFloat(area);
  const effNum = parseFloat(efficiency);
  const hoursWNum = parseFloat(hoursW);

  let estimatedPPFD: number | null = null;
  let dli: number | null = null;

  if (mode === "ppfd") {
    if (!isNaN(ppfdNum) && !isNaN(hoursNum) && ppfdNum > 0 && hoursNum > 0 && hoursNum <= 24) {
      dli = (ppfdNum * hoursNum * 3600) / 1_000_000;
    }
  } else {
    if (
      !isNaN(wattsNum) &&
      !isNaN(areaNum) &&
      !isNaN(effNum) &&
      !isNaN(hoursWNum) &&
      wattsNum > 0 &&
      areaNum > 0 &&
      effNum > 0 &&
      hoursWNum > 0 &&
      hoursWNum <= 24
    ) {
      estimatedPPFD = (wattsNum * effNum) / areaNum;
      dli = (estimatedPPFD * hoursWNum * 3600) / 1_000_000;
    }
  }

  const zone = dli !== null ? getDLIZone(dli) : null;

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Sun size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Calculadora de DLI</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Daily Light Integral — quantidade total de luz fotossintética recebida por dia.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="flex gap-1.5">
          <Button
            onClick={() => setMode("ppfd")}
            variant="ghost"
            className={cn(
              "flex-1 h-9 text-xs font-medium rounded-xl transition-colors",
              mode === "ppfd"
                ? "bg-primary/15 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted/30"
            )}
          >
            <Zap size={12} className="mr-1.5" />
            Por PPFD
          </Button>
          <Button
            onClick={() => setMode("watts")}
            variant="ghost"
            className={cn(
              "flex-1 h-9 text-xs font-medium rounded-xl transition-colors",
              mode === "watts"
                ? "bg-primary/15 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted/30"
            )}
          >
            <LayoutGrid size={12} className="mr-1.5" />
            Por Watts
          </Button>
        </div>
      </MotionItem>

      {mode === "ppfd" ? (
        <MotionItem>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Entradas — PPFD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" />
                  PPFD (µmol/m²/s)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={3000}
                    step={10}
                    value={ppfd}
                    onChange={(e) => setPpfd(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-sm text-muted-foreground">µmol/m²/s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={10}
                  value={isNaN(ppfdNum) ? 600 : Math.min(2000, Math.max(0, ppfdNum))}
                  onChange={(e) => setPpfd(e.target.value)}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sun size={12} className="text-amber-400" />
                  Horas de luz por dia
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-sm text-muted-foreground">h/dia</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={0.5}
                  value={isNaN(hoursNum) ? 18 : Math.min(24, Math.max(1, hoursNum))}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </MotionItem>
      ) : (
        <MotionItem>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Entradas — Luminária</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Potência (W)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={10}
                    value={watts}
                    onChange={(e) => setWatts(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Área (m²)</Label>
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Eficiência (µmol/J)</Label>
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Horas/dia</Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    step={0.5}
                    value={hoursW}
                    onChange={(e) => setHoursW(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {estimatedPPFD !== null && (
                <div className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2">
                  <Info size={12} className="text-muted-foreground shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    PPFD estimado: <span className="text-foreground font-semibold font-mono">{estimatedPPFD.toFixed(0)} µmol/m²/s</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </MotionItem>
      )}

      {dli !== null && zone !== null && (
        <MotionItem>
          <div className={cn("rounded-2xl border p-5 space-y-2 transition-colors", zone.bg, zone.border)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Resultado DLI</p>
            <div className="flex items-end gap-2">
              <span className={cn("text-5xl font-bold font-mono leading-none", zone.textColor)}>
                {dli.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground mb-1">mol/m²/dia</span>
            </div>
            <p className={cn("text-sm font-semibold", zone.textColor)}>{zone.label}</p>
          </div>
        </MotionItem>
      )}

      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Referência de DLI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DLI_ZONES.map((z) => (
              <div key={z.label} className="flex items-center gap-3">
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", z.color)} />
                <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{z.range}</span>
                <span className="text-xs text-foreground/80">{z.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </MotionItem>
    </MotionPage>
  );
}
