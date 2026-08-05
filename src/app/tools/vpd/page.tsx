"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Thermometer, Droplets, Wind } from "lucide-react";

type VPDZone = {
  label: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
};

function getVPDZone(vpd: number): VPDZone {
  if (vpd < 0.4) {
    return {
      label: "Muito baixo — risco de mofo",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/30",
      textColor: "text-blue-400",
    };
  } else if (vpd < 0.8) {
    return {
      label: "Propagação / Muda",
      color: "text-emerald-300",
      bg: "bg-emerald-300/10",
      border: "border-emerald-300/30",
      textColor: "text-emerald-300",
    };
  } else if (vpd < 1.2) {
    return {
      label: "Vegetativo ideal",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
      textColor: "text-primary",
    };
  } else if (vpd < 1.6) {
    return {
      label: "Floração ideal",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
      textColor: "text-amber-400",
    };
  } else {
    return {
      label: "Muito alto — estresse hídrico",
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      textColor: "text-destructive",
    };
  }
}

function calcVPD(temp: number, rh: number): number {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  return svp * (1 - rh / 100);
}

function getSuggestion(temp: number, rh: number, vpd: number): string | null {
  // Target zone: vegetativo 0.8–1.2, floração 1.2–1.6 — aim for vegetativo as generic
  const targetMin = 0.8;
  const targetMax = 1.6;

  if (vpd >= targetMin && vpd <= targetMax) return null;

  if (vpd < targetMin) {
    // Too low — either increase temp or decrease RH
    // Try reducing RH first
    let newRH = rh;
    while (newRH > 10) {
      newRH -= 1;
      if (calcVPD(temp, newRH) >= targetMin) {
        return `Reduza a umidade relativa para ${newRH}% para entrar na zona ideal`;
      }
    }
    // Try increasing temp
    let newTemp = temp;
    while (newTemp < 40) {
      newTemp += 0.5;
      if (calcVPD(newTemp, rh) >= targetMin) {
        return `Aumente a temperatura para ${newTemp.toFixed(1)}°C para entrar na zona ideal`;
      }
    }
  } else {
    // Too high — either decrease temp or increase RH
    let newRH = rh;
    while (newRH < 95) {
      newRH += 1;
      if (calcVPD(temp, newRH) <= targetMax) {
        return `Aumente a umidade relativa para ${newRH}% para entrar na zona ideal`;
      }
    }
    let newTemp = temp;
    while (newTemp > 10) {
      newTemp -= 0.5;
      if (calcVPD(newTemp, rh) <= targetMax) {
        return `Reduza a temperatura para ${newTemp.toFixed(1)}°C para entrar na zona ideal`;
      }
    }
  }

  return null;
}

const ZONES = [
  { range: "< 0.4 kPa", label: "Risco de mofo", color: "bg-blue-400" },
  { range: "0.4–0.8 kPa", label: "Propagação / Muda", color: "bg-emerald-300" },
  { range: "0.8–1.2 kPa", label: "Vegetativo ideal", color: "bg-primary" },
  { range: "1.2–1.6 kPa", label: "Floração ideal", color: "bg-amber-400" },
  { range: "> 1.6 kPa", label: "Estresse hídrico", color: "bg-destructive" },
];

export default function VPDPage() {
  const [temp, setTemp] = useState<string>("25");
  const [rh, setRH] = useState<string>("60");

  const tempNum = parseFloat(temp);
  const rhNum = parseFloat(rh);

  const isValid =
    !isNaN(tempNum) &&
    !isNaN(rhNum) &&
    tempNum >= 0 &&
    tempNum <= 50 &&
    rhNum >= 0 &&
    rhNum <= 100;

  const vpd = isValid ? calcVPD(tempNum, rhNum) : null;
  const zone = vpd !== null ? getVPDZone(vpd) : null;
  const suggestion = isValid && vpd !== null ? getSuggestion(tempNum, rhNum, vpd) : null;

  const handleNumericInput = useCallback(
    (setter: (v: string) => void, min: number, max: number) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setter(val);
      },
    []
  );

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
              Déficit de Pressão de Vapor — o parâmetro mais importante para controle ambiental do cultivo.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Parâmetros Ambientais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Thermometer size={12} className="text-amber-400" />
                Temperatura
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={temp}
                  onChange={handleNumericInput(setTemp, 0, 50)}
                  className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">°C</span>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={0.5}
                  value={isNaN(tempNum) ? 25 : Math.min(40, Math.max(10, tempNum))}
                  onChange={(e) => setTemp(e.target.value)}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Faixa recomendada: 18–30°C</p>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-400" />
                Umidade Relativa
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={rh}
                  onChange={handleNumericInput(setRH, 0, 100)}
                  className="bg-muted/20 border-border text-foreground text-center font-mono w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={isNaN(rhNum) ? 60 : Math.min(100, Math.max(0, rhNum))}
                  onChange={(e) => setRH(e.target.value)}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">UR ideal: 40–70% dependendo da fase</p>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {vpd !== null && zone !== null && (
        <MotionItem>
          <div className={cn("rounded-2xl border p-5 space-y-3 transition-colors", zone.bg, zone.border)}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Resultado VPD</p>
            <div className="flex items-end gap-2">
              <span className={cn("text-5xl font-bold font-mono leading-none", zone.textColor)}>
                {vpd.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground mb-1">kPa</span>
            </div>
            <p className={cn("text-sm font-semibold", zone.textColor)}>{zone.label}</p>

            {suggestion && (
              <>
                <Separator className="bg-white/10" />
                <div className="flex items-start gap-2">
                  <Wind size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{suggestion}</p>
                </div>
              </>
            )}
          </div>
        </MotionItem>
      )}

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
