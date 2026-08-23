"use client";

import { useMemo, useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { usePlants } from "@/hooks/use-plants";
import { useDiary } from "@/hooks/use-diary";
import { useAuth } from "@/contexts/auth-context";
import { EnvChart } from "@/components/dashboard/env-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, FlaskConical, Filter } from "lucide-react";
import type { GrowEvent, DiaryEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

const WATER_TYPES = new Set(["rega", "rega_fertilizante", "flush_pre_flip", "flush_pre_colheita"]);
const RUNOFF_TYPE = "run_off";

// Unified shape for records from both grow_events and diary collections
interface WaterRecord {
  id: string;
  date: string;
  time?: string;
  type: string;
  plantIds: string[];
  waterAmount?: number;
  ph?: number;
  ppm?: number;
  phRunoff?: number;
  ppmRunoff?: number;
  irrigationType?: string;
  fertilizersUsed?: GrowEvent["fertilizersUsed"];
  notes?: string;
}

function fromGrowEvent(ev: GrowEvent): WaterRecord {
  return {
    ...ev,
    plantIds: ev.plantIds ?? (ev.plantId ? [ev.plantId] : []),
  };
}

function fromDiaryEntry(e: DiaryEntry): WaterRecord {
  return {
    id: e.id,
    date: e.date,
    type: e.type,
    plantIds: e.plantId ? [e.plantId] : [],
    waterAmount: e.waterAmount,
    ph: e.ph,
    ppm: e.ppm,
    phRunoff: e.phRunoff,
    ppmRunoff: e.ppmRunoff,
    irrigationType: e.irrigationType,
    fertilizersUsed: e.fertilizersUsed,
    notes: e.notes || undefined,
  };
}

function fmt(dateStr: string) {
  try { return format(parseISO(dateStr), "dd/MM HH:mm", { locale: ptBR }); }
  catch { return dateStr.slice(0, 16); }
}

function fmtShort(dateStr: string) {
  try { return format(parseISO(dateStr), "dd/MM", { locale: ptBR }); }
  catch { return dateStr.slice(5, 10); }
}

function avg(arr: (number | undefined)[]): number | null {
  const vals = arr.filter((v): v is number => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function last(arr: (number | undefined)[]): number | null {
  const vals = arr.filter((v): v is number => v != null);
  return vals.length ? vals[vals.length - 1] : null;
}

export default function WaterPage() {
  const { user } = useAuth();
  const { events, loading: evLoading } = useEvents();
  const { entries, loading: diaryLoading } = useDiary();
  const { plants } = usePlants();
  const [plantFilter, setPlantFilter] = useState<string>("all");

  const loading = evLoading || diaryLoading;
  const plantMap = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants]);

  // Merge grow_events + diary entries into a unified list, deduplicated by id
  const allRecords = useMemo<WaterRecord[]>(() => {
    const fromEvents = events
      .filter((ev) => WATER_TYPES.has(ev.type) || ev.type === RUNOFF_TYPE)
      .map(fromGrowEvent);
    const fromDiary = entries
      .filter((e) => WATER_TYPES.has(e.type as string) || e.type === RUNOFF_TYPE)
      .map(fromDiaryEntry);
    const seen = new Set<string>();
    const merged: WaterRecord[] = [];
    for (const r of [...fromEvents, ...fromDiary]) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
    }
    return merged;
  }, [events, entries]);

  const waterRecords = useMemo(() =>
    allRecords
      .filter((r) => WATER_TYPES.has(r.type))
      .filter((r) => {
        if (plantFilter === "all") return true;
        return r.plantIds.includes(plantFilter);
      })
      .sort((a, b) => a.date.localeCompare(b.date)),
  [allRecords, plantFilter]);

  const runoffRecords = useMemo(() =>
    allRecords
      .filter((r) => r.type === RUNOFF_TYPE)
      .filter((r) => {
        if (plantFilter === "all") return true;
        return r.plantIds.includes(plantFilter);
      })
      .sort((a, b) => a.date.localeCompare(b.date)),
  [allRecords, plantFilter]);

  const historyRecords = useMemo(
    () => [...waterRecords, ...runoffRecords].sort((a, b) => {
      const da = `${a.date}T${a.time ?? "00:00"}`;
      const db = `${b.date}T${b.time ?? "00:00"}`;
      return db.localeCompare(da);
    }),
    [waterRecords, runoffRecords]
  );

  function toChartData(recs: WaterRecord[], key: keyof WaterRecord) {
    return recs.map((r) => ({
      label: fmtShort(r.date),
      value: (r[key] as number | undefined) ?? null,
    }));
  }

  const avgVolume   = avg(waterRecords.map((r) => r.waterAmount));
  const avgPh       = avg(waterRecords.map((r) => r.ph));
  const avgPpm      = avg(waterRecords.map((r) => r.ppm));
  const avgPhRunoff = avg(runoffRecords.map((r) => r.phRunoff));
  const lastPh      = last(waterRecords.map((r) => r.ph));
  const lastPpm     = last(waterRecords.map((r) => r.ppm));
  const lastPhRo    = last(runoffRecords.map((r) => r.phRunoff));

  if (!user) return null;

  return (
    <MotionPage>
    <div className="space-y-6 max-w-5xl mx-auto">
      <MotionItem>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets size={22} className="text-cyan-400" />
          Monitoramento de Rega
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Histórico de regas, run off e qualidade da água
        </p>
      </div>
      </MotionItem>

      {/* Plant filter */}
      {plants.length > 0 && (
        <MotionItem>
        <div className="flex gap-1.5 flex-wrap items-center">
          <Filter size={12} className="text-muted-foreground/60 shrink-0" />
          <button
            onClick={() => setPlantFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
              plantFilter === "all"
                ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Todas as plantas
          </button>
          {plants.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlantFilter(p.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                plantFilter === p.id
                  ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        </MotionItem>
      )}

      {/* Stat cards */}
      <MotionItem>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-cyan-400/10 flex items-center justify-center">
                <Droplets size={14} className="text-cyan-400" />
              </div>
              Volume médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgVolume != null ? `${Math.round(avgVolume)} mL` : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{waterRecords.length} rega{waterRecords.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-400/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-400">pH</span>
              </div>
              pH entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgPh != null ? avgPh.toFixed(2) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Último: {lastPh != null ? lastPh.toFixed(1) : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-400/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-purple-400">ppm</span>
              </div>
              PPM entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgPpm != null ? `${Math.round(avgPpm)}` : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Último: {lastPpm != null ? lastPpm : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-300/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-300">pH</span>
              </div>
              pH Run Off
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgPhRunoff != null ? avgPhRunoff.toFixed(2) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Último: {lastPhRo != null ? lastPhRo.toFixed(1) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
      </MotionItem>

      {/* Charts */}
      <MotionItem>
      <div className="grid grid-cols-2 gap-3">
        <EnvChart
          title="Volume por rega (mL)"
          unit=" mL"
          data={toChartData(waterRecords, "waterAmount")}
          color="#22d3ee"
          decimals={0}
          emptyMessage="Nenhuma rega registrada"
        />
        <EnvChart
          title="pH entrada"
          unit=""
          data={toChartData(waterRecords, "ph")}
          color="#60a5fa"
          refMin={5.8}
          refMax={6.5}
          emptyMessage="Sem dados de pH"
        />
        <EnvChart
          title="PPM entrada"
          unit=" ppm"
          data={toChartData(waterRecords, "ppm")}
          color="#c084fc"
          decimals={0}
          emptyMessage="Sem dados de PPM"
        />
        <EnvChart
          title="pH Run Off"
          unit=""
          data={toChartData(runoffRecords, "phRunoff")}
          color="#93c5fd"
          refMin={5.8}
          refMax={6.5}
          emptyMessage="Nenhum run off registrado"
        />
      </div>
      </MotionItem>

      {/* History */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
          ) : historyRecords.length === 0 ? (
            <div className="py-8 text-center">
              <Droplets size={28} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma rega registrada.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Registre uma rega pelo Calendário ou pelo Dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyRecords.map((r) => {
                const isRunoff = r.type === RUNOFF_TYPE;
                const plantLabels = r.plantIds
                  .map((id) => plantMap.get(id)?.name)
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={r.id}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl border px-3 py-2.5",
                      isRunoff
                        ? "bg-blue-300/5 border-blue-300/20"
                        : "bg-cyan-400/5 border-cyan-400/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{isRunoff ? "🔵" : "💧"}</span>
                        <span className={cn(
                          "text-xs font-semibold",
                          isRunoff ? "text-blue-300" : "text-cyan-400"
                        )}>
                          {isRunoff ? "Run Off" : r.type === "rega_fertilizante" ? "Rega c/ Fertilizante" : "Rega"}
                        </span>
                        {plantLabels && (
                          <span className="text-xs text-muted-foreground">· {plantLabels}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {fmt(`${r.date}${r.time ? `T${r.time}` : "T00:00"}`)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {r.waterAmount != null && (
                        <span className="text-[11px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-lg px-2 py-0.5 font-medium">
                          {r.waterAmount} mL
                        </span>
                      )}
                      {r.ph != null && (
                        <span className="text-[11px] bg-blue-400/10 border border-blue-400/20 text-blue-400 rounded-lg px-2 py-0.5 font-medium">
                          pH in: {r.ph}
                        </span>
                      )}
                      {r.ppm != null && (
                        <span className="text-[11px] bg-purple-400/10 border border-purple-400/20 text-purple-400 rounded-lg px-2 py-0.5 font-medium">
                          {r.ppm} ppm
                        </span>
                      )}
                      {r.phRunoff != null && (
                        <span className="text-[11px] bg-blue-300/10 border border-blue-300/20 text-blue-300 rounded-lg px-2 py-0.5 font-medium">
                          pH out: {r.phRunoff}
                        </span>
                      )}
                      {r.ppmRunoff != null && (
                        <span className="text-[11px] bg-blue-300/10 border border-blue-300/20 text-blue-300 rounded-lg px-2 py-0.5 font-medium">
                          {r.ppmRunoff} ppm out
                        </span>
                      )}
                      {r.irrigationType && (
                        <span className="text-[11px] bg-muted/40 border border-border text-muted-foreground rounded-lg px-2 py-0.5">
                          {r.irrigationType === "gotejamento" ? "Gotejamento" :
                           r.irrigationType === "aspersao" ? "Aspersão" :
                           r.irrigationType === "automatico" ? "Automático" : "Manual"}
                        </span>
                      )}
                    </div>

                    {r.fertilizersUsed && r.fertilizersUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.fertilizersUsed.map((f) => (
                          <span
                            key={f.fertilizerId}
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          >
                            <FlaskConical size={9} />
                            {f.name}
                            {f.mlPerLiter > 0 && <span className="opacity-70">{f.mlPerLiter} mL/L</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {r.notes && (
                      <p className="text-xs text-foreground/70">{r.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </MotionItem>
    </div>
    </MotionPage>
  );
}
