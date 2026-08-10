"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEnvironment } from "@/hooks/use-environment";
import { useSpaces } from "@/hooks/use-spaces";
import { createEnvironmentRecord, deleteEnvironmentRecord, calcVPD } from "@/lib/environment";
import { STAGE_ENV_RANGES, STAGE_RANGE_LABELS, STAGE_RANGE_EMOJI } from "@/lib/env-ranges";
import { STAGE_ORDER } from "@/lib/constants";
import type { GrowStage } from "@/lib/types";
import { EnvChart } from "@/components/dashboard/env-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Thermometer, Droplets, Wind, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

function fmt(date: string) {
  try {
    return format(new Date(date), "dd/MM HH:mm", { locale: ptBR });
  } catch {
    return date.slice(0, 16);
  }
}

function fmtShort(date: string) {
  try {
    return format(new Date(date), "dd/MM", { locale: ptBR });
  } catch {
    return date.slice(5, 10);
  }
}

function localDatetimeStr(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function EnvironmentPage() {
  const { user } = useAuth();
  const { records, loading, refresh } = useEnvironment();
  const { spaces } = useSpaces();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartStage, setChartStage] = useState<GrowStage>("vegetativo");

  const [form, setForm] = useState({
    spaceId: "",
    temperature: "",
    humidity: "",
    co2: "",
    recordedAt: localDatetimeStr(),
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function openForm() {
    setForm({
      spaceId: spaces[0]?.id ?? "",
      temperature: "",
      humidity: "",
      co2: "",
      recordedAt: localDatetimeStr(),
    });
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.temperature && !form.humidity && !form.co2) {
      setError("Informe ao menos um valor.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createEnvironmentRecord(user.uid, {
        spaceId: form.spaceId || undefined,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        humidity: form.humidity ? Number(form.humidity) : undefined,
        co2: form.co2 ? Number(form.co2) : undefined,
        recordedAt: form.recordedAt,
      });
      setOpen(false);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Environment] save error:", msg);
      setError(`Erro ao salvar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteEnvironmentRecord(id);
    refresh();
  }

  // Averages over all records
  function avg(key: "temperature" | "humidity" | "co2"): number | null {
    const vals = records.map((r) => r[key]).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const avgTemp = avg("temperature");
  const avgHum  = avg("humidity");
  const avgCo2  = avg("co2");
  const avgVPD  = (() => {
    const vals = records
      .filter((r) => r.temperature != null && r.humidity != null)
      .map((r) => calcVPD(r.temperature!, r.humidity!));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  // Latest for secondary display
  const latest = records[0];

  const chartRecords = [...records].reverse().slice(-14);

  function toChartData(key: "temperature" | "humidity" | "co2") {
    return chartRecords.map((r) => ({
      label: fmtShort(r.recordedAt),
      value: r[key] ?? null,
    }));
  }

  const vpdData = chartRecords.map((r) => ({
    label: fmtShort(r.recordedAt),
    value:
      r.temperature != null && r.humidity != null
        ? calcVPD(r.temperature, r.humidity)
        : null,
  }));

  return (
    <MotionPage>
    <div className="space-y-6 max-w-5xl mx-auto">
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ambiente</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitore temperatura, umidade e CO₂</p>
        </div>
        <Button onClick={openForm} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} />
          Registrar
        </Button>
      </div>
      </MotionItem>

      {/* Stats — média histórica */}
      <MotionItem>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Temperatura",
            icon: Thermometer,
            color: "text-orange-400",
            bg: "bg-orange-400/10",
            avg: avgTemp != null ? `${avgTemp.toFixed(1)}°C` : "—",
            last: latest?.temperature != null ? `${latest.temperature}°C` : null,
          },
          {
            label: "Umidade",
            icon: Droplets,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            avg: avgHum != null ? `${avgHum.toFixed(1)}%` : "—",
            last: latest?.humidity != null ? `${latest.humidity}%` : null,
          },
          {
            label: "VPD",
            icon: Wind,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            avg: avgVPD != null ? `${avgVPD.toFixed(2)} kPa` : "—",
            last: latest?.temperature != null && latest?.humidity != null
              ? `${calcVPD(latest.temperature, latest.humidity)} kPa`
              : null,
          },
          {
            label: "CO₂",
            icon: Wind,
            color: "text-green-400",
            bg: "bg-green-400/10",
            avg: avgCo2 != null ? `${Math.round(avgCo2)} ppm` : "—",
            last: latest?.co2 != null ? `${latest.co2} ppm` : null,
          },
        ].map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md ${m.bg} flex items-center justify-center`}>
                  <m.icon size={14} className={m.color} />
                </div>
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{m.avg}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Média geral · {records.length} registro{records.length !== 1 ? "s" : ""}
              </p>
              {m.last && (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Último: {m.last}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      </MotionItem>

      {/* Charts */}
      <MotionItem>
      <div className="space-y-3">
        {/* Seletor de fase */}
        <div className="flex gap-1.5 flex-wrap">
          {STAGE_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setChartStage(s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                chartStage === s
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{STAGE_RANGE_EMOJI[s]}</span>
              {STAGE_RANGE_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <EnvChart title="Temperatura" unit="°C" data={toChartData("temperature")} color="#f97316"
            refMin={STAGE_ENV_RANGES[chartStage].temperature.min}
            refMax={STAGE_ENV_RANGES[chartStage].temperature.max} />
          <EnvChart title="Umidade" unit="%" data={toChartData("humidity")} color="#3b82f6" decimals={0}
            refMin={STAGE_ENV_RANGES[chartStage].humidity.min}
            refMax={STAGE_ENV_RANGES[chartStage].humidity.max} />
          <EnvChart title="VPD" unit=" kPa" data={vpdData} color="#a855f7"
            refMin={STAGE_ENV_RANGES[chartStage].vpd.min}
            refMax={STAGE_ENV_RANGES[chartStage].vpd.max} />
          <EnvChart title="CO₂" unit=" ppm" data={toChartData("co2")} color="#22c55e" decimals={0}
            refMin={STAGE_ENV_RANGES[chartStage].co2.min}
            refMax={STAGE_ENV_RANGES[chartStage].co2.max} />
        </div>
      </div>
      </MotionItem>

      {/* History */}
      <MotionItem>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Histórico de registros</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
          ) : records.length === 0 ? (
            <div className="py-8 text-center">
              <Thermometer size={28} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 20).map((r) => {
                const space = spaces.find((s) => s.id === r.spaceId);
                const vpd = r.temperature != null && r.humidity != null ? calcVPD(r.temperature, r.humidity) : null;
                return (
                  <div key={r.id} className="flex items-center gap-3 bg-background border border-border rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">{fmt(r.recordedAt)}</span>
                        {space && <span className="text-xs text-primary/80">{space.name}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {r.temperature != null && <span className="text-xs text-foreground">🌡️ {r.temperature}°C</span>}
                        {r.humidity != null && <span className="text-xs text-foreground">💧 {r.humidity}%</span>}
                        {vpd != null && <span className="text-xs text-foreground">VPD: {vpd} kPa</span>}
                        {r.co2 != null && <span className="text-xs text-foreground">CO₂: {r.co2} ppm</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors p-1 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </MotionItem>

      {/* Record dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Ambiente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {spaces.length > 0 && (
              <div className="space-y-1.5">
                <Label>Espaço</Label>
                <select
                  value={form.spaceId}
                  onChange={(e) => set("spaceId", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Nenhum (geral)</option>
                  {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="recordedAt">Data e Hora</Label>
              <Input
                id="recordedAt"
                type="datetime-local"
                value={form.recordedAt}
                onChange={(e) => set("recordedAt", e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="temp">Temp (°C)</Label>
                <Input id="temp" type="number" step="0.1" placeholder="24" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} className="bg-background border-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hum">Umidade (%)</Label>
                <Input id="hum" type="number" step="1" placeholder="55" value={form.humidity} onChange={(e) => set("humidity", e.target.value)} className="bg-background border-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co2">CO₂ (ppm)</Label>
                <Input id="co2" type="number" step="10" placeholder="1000" value={form.co2} onChange={(e) => set("co2", e.target.value)} className="bg-background border-border" />
              </div>
            </div>
            {form.temperature && form.humidity && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                VPD calculado: <span className="font-semibold text-foreground">
                  {calcVPD(Number(form.temperature), Number(form.humidity))} kPa
                </span>
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Cancelar</Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </MotionPage>
  );
}
