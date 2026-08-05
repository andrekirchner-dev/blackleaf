"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Scissors, Droplets, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FlushPage() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [flipDate, setFlipDate] = useState<string>(todayStr);
  const [strainWeeks, setStrainWeeks] = useState<string>("9");
  const [flushWeeks, setFlushWeeks] = useState<string>("2");

  const strainWeeksNum = parseFloat(strainWeeks) || 0;
  const flushWeeksNum = parseFloat(flushWeeks) || 0;

  const isValid =
    flipDate !== "" &&
    strainWeeksNum > 0 &&
    flushWeeksNum >= 0 &&
    flushWeeksNum < strainWeeksNum;

  let results: {
    flipDay: Date;
    flushStart: Date;
    harvestDay: Date;
    daysToFlush: number;
    daysToHarvest: number;
    floraDaysElapsed: number;
    floraTotalDays: number;
    progressPct: number;
    flushAlreadyStarted: boolean;
    alreadyHarvested: boolean;
  } | null = null;

  if (isValid) {
    const flipDay = new Date(flipDate + "T12:00:00");
    const floraTotalDays = strainWeeksNum * 7;
    const flushStartDay = Math.round((strainWeeksNum - flushWeeksNum) * 7);
    const flushStart = addDays(flipDay, flushStartDay);
    const harvestDay = addDays(flipDay, floraTotalDays);

    const daysToFlush = diffDays(today, flushStart);
    const daysToHarvest = diffDays(today, harvestDay);
    const floraDaysElapsed = diffDays(flipDay, today);

    const progressPct = Math.min(100, Math.max(0, (floraDaysElapsed / floraTotalDays) * 100));
    const flushAlreadyStarted = daysToFlush <= 0 && daysToHarvest > 0;
    const alreadyHarvested = daysToHarvest <= 0;

    results = {
      flipDay,
      flushStart,
      harvestDay,
      daysToFlush,
      daysToHarvest,
      floraDaysElapsed: Math.max(0, floraDaysElapsed),
      floraTotalDays,
      progressPct,
      flushAlreadyStarted,
      alreadyHarvested,
    };
  }

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Droplets size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Flush e Colheita</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Calcule as datas de início do flush e colheita com base no flip e na genética.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Dados do Cultivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays size={12} className="text-primary" />
                Data do Flip para Flora (12/12)
              </Label>
              <Input
                type="date"
                value={flipDate}
                onChange={(e) => setFlipDate(e.target.value)}
                className="bg-muted/20 border-border text-foreground font-mono [color-scheme:dark]"
              />
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} className="text-amber-400" />
                  Semanas de Floração da Strain
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={4}
                    max={20}
                    step={1}
                    value={strainWeeks}
                    onChange={(e) => setStrainWeeks(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">sem</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={20}
                  step={1}
                  value={isNaN(parseFloat(strainWeeks)) ? 9 : Math.min(20, Math.max(4, parseFloat(strainWeeks)))}
                  onChange={(e) => setStrainWeeks(e.target.value)}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Droplets size={12} className="text-blue-400" />
                  Semanas de Flush
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={4}
                    step={0.5}
                    value={flushWeeks}
                    onChange={(e) => setFlushWeeks(e.target.value)}
                    className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">sem</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={0.5}
                  value={isNaN(parseFloat(flushWeeks)) ? 2 : Math.min(4, Math.max(0, parseFloat(flushWeeks)))}
                  onChange={(e) => setFlushWeeks(e.target.value)}
                  className="w-full accent-blue-400 h-1.5 rounded-full cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {results && (
        <>
          {/* Progress bar */}
          <MotionItem>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Progresso da Flora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-mono text-primary">{results.progressPct.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground mb-1">
                    {Math.min(results.floraDaysElapsed, results.floraTotalDays)} / {results.floraTotalDays} dias
                  </span>
                </div>

                {/* Progress track */}
                <div className="relative w-full h-4 bg-muted/30 rounded-full overflow-hidden">
                  {/* Flora progress */}
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${results.progressPct}%` }}
                  />
                  {/* Flush zone marker */}
                  {results.floraTotalDays > 0 && (
                    <div
                      className="absolute top-0 h-full bg-blue-400/30 border-l border-blue-400"
                      style={{
                        left: `${((results.floraTotalDays - flushWeeksNum * 7) / results.floraTotalDays) * 100}%`,
                        width: `${(flushWeeksNum * 7 / results.floraTotalDays) * 100}%`,
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-primary/80" />
                    Flora
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-blue-400/40 border border-blue-400" />
                    Flush
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionItem>

          {/* Date cards */}
          <MotionItem>
            <div className="grid grid-cols-1 gap-3">
              {/* Flush start */}
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-1 transition-colors",
                  results.flushAlreadyStarted
                    ? "bg-blue-400/10 border-blue-400/30"
                    : results.daysToFlush <= 7
                    ? "bg-amber-400/10 border-amber-400/30"
                    : "bg-muted/10 border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets
                      size={13}
                      className={cn(
                        results.flushAlreadyStarted
                          ? "text-blue-400"
                          : results.daysToFlush <= 7
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                    <p className="text-xs font-semibold text-foreground">Início do Flush</p>
                  </div>
                  {results.flushAlreadyStarted ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-400 border border-blue-400/30 font-medium">
                      Em andamento
                    </span>
                  ) : results.daysToFlush <= 7 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 font-medium">
                      Em breve
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-foreground">{formatDate(results.flushStart)}</p>
                {!results.flushAlreadyStarted && !results.alreadyHarvested && results.daysToFlush > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Faltam <span className="text-foreground font-semibold">{results.daysToFlush}</span> dia{results.daysToFlush !== 1 ? "s" : ""}
                  </p>
                )}
                {results.flushAlreadyStarted && (
                  <p className="text-[11px] text-blue-400">
                    Iniciado há {Math.abs(results.daysToFlush)} dia{Math.abs(results.daysToFlush) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Harvest */}
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-1 transition-colors",
                  results.alreadyHarvested
                    ? "bg-primary/10 border-primary/30"
                    : results.daysToHarvest <= 7
                    ? "bg-amber-400/10 border-amber-400/30"
                    : "bg-muted/10 border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Scissors
                      size={13}
                      className={cn(
                        results.alreadyHarvested
                          ? "text-primary"
                          : results.daysToHarvest <= 7
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                    <p className="text-xs font-semibold text-foreground">Data de Colheita</p>
                  </div>
                  {results.alreadyHarvested && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-medium flex items-center gap-0.5">
                      <CheckCircle2 size={9} /> Pronta
                    </span>
                  )}
                  {!results.alreadyHarvested && results.daysToHarvest <= 7 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 font-medium flex items-center gap-0.5">
                      <AlertTriangle size={9} /> Quase lá!
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{formatDate(results.harvestDay)}</p>
                {!results.alreadyHarvested && results.daysToHarvest > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Faltam <span className="text-foreground font-semibold">{results.daysToHarvest}</span> dia{results.daysToHarvest !== 1 ? "s" : ""}
                  </p>
                )}
                {results.alreadyHarvested && (
                  <p className="text-[11px] text-primary">
                    Período ideal de colheita passou há {Math.abs(results.daysToHarvest)} dia{Math.abs(results.daysToHarvest) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </MotionItem>

          {/* Timeline summary */}
          <MotionItem>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Resumo do Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  {
                    icon: <CalendarDays size={12} className="text-primary" />,
                    label: "Flip para flora",
                    value: formatDateShort(results.flipDay),
                    sub: "Dia 0",
                  },
                  {
                    icon: <Droplets size={12} className="text-blue-400" />,
                    label: "Início do flush",
                    value: formatDateShort(results.flushStart),
                    sub: `Dia ${Math.round((strainWeeksNum - flushWeeksNum) * 7)}`,
                  },
                  {
                    icon: <Scissors size={12} className="text-amber-400" />,
                    label: "Colheita prevista",
                    value: formatDateShort(results.harvestDay),
                    sub: `Dia ${results.floraTotalDays}`,
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-foreground font-mono">{row.value}</p>
                      <p className="text-[10px] text-muted-foreground">{row.sub}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </MotionItem>
        </>
      )}
    </MotionPage>
  );
}
