"use client";

import { useState, useMemo } from "react";
import { BookOpen, Plus, Filter, Trash2, Droplets, FlaskConical, Thermometer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DiaryForm } from "@/components/diary/diary-form";
import { useDiary } from "@/hooks/use-diary";
import { usePlants } from "@/hooks/use-plants";
import { useFertilizers } from "@/hooks/use-fertilizers";
import { useEvents } from "@/hooks/use-events";
import { useEnvironment } from "@/hooks/use-environment";
import { useHarvest } from "@/hooks/use-harvest";
import { useSpaces } from "@/hooks/use-spaces";
import { getEntryMeta } from "@/lib/diary-constants";
import { EVENT_BY_TYPE } from "@/lib/event-constants";
import { PRUNING_BY_TYPE } from "@/lib/pruning-constants";
import { deleteEntry } from "@/lib/diary";
import { deleteGrowEvent } from "@/lib/events";
import { deleteEnvironmentRecord, calcVPD } from "@/lib/environment";
import { deleteHarvestLog } from "@/lib/harvest";
import type { DiaryEntry } from "@/lib/types";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

type LogSource = "diary" | "event" | "environment" | "harvest";

interface LogItem {
  id: string;
  sortDate: Date;
  source: LogSource;
  emoji: string;
  label: string;
  color: string;
  subtitle?: string;
  chips?: string[];
  notes?: string;
  plantId?: string;
  diaryEntry?: DiaryEntry;
  onDelete: () => Promise<void>;
}

const SOURCE_OPTIONS: { value: LogSource | "all"; label: string; emoji: string }[] = [
  { value: "all",         label: "Tudo",      emoji: "📋" },
  { value: "diary",       label: "Diário",    emoji: "📝" },
  { value: "event",       label: "Eventos",   emoji: "📅" },
  { value: "environment", label: "Ambiente",  emoji: "🌡️" },
  { value: "harvest",     label: "Colheitas", emoji: "🌾" },
];

function safeParse(dateStr: string): Date {
  try { return parseISO(dateStr); } catch { return new Date(dateStr); }
}

function fmtDate(d: Date): string {
  try {
    return format(d, "HH:mm · dd MMM", { locale: ptBR });
  } catch {
    return d.toISOString().slice(0, 16);
  }
}

function dayKey(d: Date): string {
  try { return format(d, "yyyy-MM-dd"); } catch { return ""; }
}

function dayLabel(d: Date): string {
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd 'de' MMMM, yyyy", { locale: ptBR });
}

function ActivityCard({ item, onDeleted }: { item: LogItem; onDeleted: () => void }) {
  async function handleDelete() {
    if (!confirm("Excluir este registro?")) return;
    await item.onDelete();
    onDeleted();
  }

  return (
    <div className="flex gap-3 group">
      {/* Timeline icon */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0",
          item.color
        )}>
          {item.emoji}
        </div>
        <div className="w-px flex-1 bg-border mt-2 min-h-[16px]" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", item.color)}>
                  {item.label}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-muted-foreground font-medium truncate">{item.subtitle}</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{fmtDate(item.sortDate)}</p>
            </div>
            <button
              onClick={handleDelete}
              className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1 shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Metrics chips */}
          {item.chips && item.chips.length > 0 && (
            <div className="flex flex-wrap gap-2 py-1.5 border-t border-border">
              {item.chips.map((chip) => (
                <span key={chip} className="text-[11px] text-foreground/80 bg-muted/40 rounded-lg px-2 py-0.5 font-medium">
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Fertilizers (diary only) */}
          {item.diaryEntry?.fertilizersUsed && item.diaryEntry.fertilizersUsed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1.5 border-t border-border">
              {item.diaryEntry.fertilizersUsed.map((f) => (
                <span
                  key={f.fertilizerId}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400"
                >
                  <FlaskConical size={9} />
                  {f.name}
                  {f.mlPerLiter > 0 && <span className="text-amber-400/70">{f.mlPerLiter} mL/L</span>}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-foreground/80 leading-relaxed">{item.notes}</p>
          )}

          {/* Photo */}
          {item.diaryEntry?.photoUrl && (
            <div className="rounded-lg overflow-hidden border border-border mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.diaryEntry.photoUrl}
                alt="Registro fotográfico"
                className="w-full object-cover max-h-64"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiaryPage() {
  const { entries, loading: loadingDiary, refresh: refreshDiary } = useDiary();
  const { events, loading: loadingEvents, refresh: refreshEvents } = useEvents();
  const { records, loading: loadingEnv, refresh: refreshEnv } = useEnvironment();
  const { harvests, loading: loadingHarvest, refresh: refreshHarvest } = useHarvest();
  const { plants, loading: loadingPlants } = usePlants();
  const { spaces } = useSpaces();
  const { fertilizers } = useFertilizers();

  const [open, setOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<LogSource | "all">("all");
  const [plantFilter, setPlantFilter] = useState<string>("all");

  const plantMap = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants]);
  const spaceMap = useMemo(() => new Map(spaces.map((s) => [s.id, s])), [spaces]);

  const allItems = useMemo((): LogItem[] => {
    const items: LogItem[] = [];

    // Diary entries
    for (const e of entries) {
      const meta = getEntryMeta(e.type);
      const chips: string[] = [];
      if (e.pruningType) chips.push(PRUNING_BY_TYPE[e.pruningType]?.label ?? e.pruningType);
      if (e.irrigationType) chips.push(
        e.irrigationType === "gotejamento" ? "Gotejamento" :
        e.irrigationType === "aspersao" ? "Aspersão" :
        e.irrigationType === "automatico" ? "Automático" : "Manual"
      );
      if (e.waterAmount) chips.push(`${e.waterAmount} mL`);
      if (e.ph)         chips.push(`pH in: ${e.ph}`);
      if (e.ppm)        chips.push(`${e.ppm} ppm`);
      if (e.phRunoff)   chips.push(`pH out: ${e.phRunoff}`);
      if (e.ppmRunoff)  chips.push(`${e.ppmRunoff} ppm out`);
      if (e.ec)         chips.push(`EC: ${e.ec} mS/cm`);
      items.push({
        id: `diary_${e.id}`,
        sortDate: safeParse(e.date),
        source: "diary",
        emoji: meta.emoji,
        label: meta.label,
        color: meta.color,
        subtitle: plantMap.get(e.plantId)?.name,
        chips,
        notes: e.notes || undefined,
        plantId: e.plantId,
        diaryEntry: e,
        onDelete: async () => { await deleteEntry(e.id); refreshDiary(); },
      });
    }

    // Grow events (calendar)
    for (const ev of events) {
      const meta = EVENT_BY_TYPE[ev.type];
      if (!meta) continue;
      const plantIds = ev.plantIds ?? (ev.plantId ? [ev.plantId] : []);
      const subtitle = plantIds.map((id) => plantMap.get(id)?.name).filter(Boolean).join(", ");
      const eventChips: string[] = [];
      if (ev.type === "poda" && ev.pruningType) eventChips.push(PRUNING_BY_TYPE[ev.pruningType]?.label ?? ev.pruningType);
      if (ev.waterAmount != null) eventChips.push(`${ev.waterAmount} mL`);
      if (ev.ph != null) eventChips.push(`pH in: ${ev.ph}`);
      if (ev.ppm != null) eventChips.push(`${ev.ppm} ppm`);
      if (ev.phRunoff != null) eventChips.push(`pH out: ${ev.phRunoff}`);
      if (ev.ppmRunoff != null) eventChips.push(`${ev.ppmRunoff} ppm out`);
      if (ev.irrigationType) eventChips.push(
        ev.irrigationType === "gotejamento" ? "Gotejamento" :
        ev.irrigationType === "aspersao" ? "Aspersão" :
        ev.irrigationType === "automatico" ? "Automático" : "Manual"
      );
      let sortDate: Date;
      try { sortDate = new Date(`${ev.date}T${ev.time ?? "00:00"}`); }
      catch { sortDate = new Date(ev.date); }

      // Build a partial DiaryEntry to reuse fertilizer rendering in ActivityCard
      const evAsDiaryLike = ev.fertilizersUsed && ev.fertilizersUsed.length > 0
        ? { fertilizersUsed: ev.fertilizersUsed } as import("@/lib/types").DiaryEntry
        : undefined;

      items.push({
        id: `event_${ev.id}`,
        sortDate,
        source: "event",
        emoji: meta.emoji,
        label: meta.label,
        color: `${meta.color} ${meta.bg}`,
        subtitle: subtitle || undefined,
        chips: eventChips.length > 0 ? eventChips : undefined,
        notes: ev.notes || undefined,
        plantId: plantIds[0],
        diaryEntry: evAsDiaryLike,
        onDelete: async () => { await deleteGrowEvent(ev.id); refreshEvents(); },
      });
    }

    // Environment records
    for (const r of records) {
      const chips: string[] = [];
      if (r.temperature != null) chips.push(`🌡️ ${r.temperature}°C`);
      if (r.humidity    != null) chips.push(`💧 ${r.humidity}%`);
      if (r.co2         != null) chips.push(`CO₂ ${r.co2} ppm`);
      if (r.temperature != null && r.humidity != null)
        chips.push(`VPD ${calcVPD(r.temperature, r.humidity).toFixed(2)} kPa`);
      items.push({
        id: `env_${r.id}`,
        sortDate: safeParse(r.recordedAt),
        source: "environment",
        emoji: "🌡️",
        label: "Ambiente",
        color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
        subtitle: r.spaceId ? spaceMap.get(r.spaceId)?.name : undefined,
        chips,
        onDelete: async () => { await deleteEnvironmentRecord(r.id); refreshEnv(); },
      });
    }

    // Harvests
    for (const h of harvests) {
      const chips: string[] = [];
      if (h.wetWeightG)   chips.push(`Úmido: ${h.wetWeightG}g`);
      if (h.dryWeightG)   chips.push(`Seco: ${h.dryWeightG}g`);
      if (h.curedWeightG) chips.push(`Curado: ${h.curedWeightG}g`);
      if (h.rating)       chips.push(`⭐ ${h.rating}/5`);
      items.push({
        id: `harvest_${h.id}`,
        sortDate: safeParse(h.harvestDate),
        source: "harvest",
        emoji: "🌾",
        label: "Colheita",
        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        subtitle: `${h.plantName}${h.strain ? ` · ${h.strain}` : ""}`,
        chips,
        notes: h.notes || undefined,
        plantId: h.plantId,
        onDelete: async () => { await deleteHarvestLog(h.id); refreshHarvest(); },
      });
    }

    return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [entries, events, records, harvests, plantMap, spaceMap, refreshDiary, refreshEvents, refreshEnv, refreshHarvest]);

  const filtered = useMemo(() => allItems.filter((item) => {
    if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
    if (plantFilter !== "all" && item.plantId !== plantFilter) return false;
    return true;
  }), [allItems, sourceFilter, plantFilter]);

  const grouped = useMemo(() => {
    const groups: { key: string; label: string; items: LogItem[] }[] = [];
    const seen = new Map<string, number>();
    for (const item of filtered) {
      const key = dayKey(item.sortDate);
      if (!seen.has(key)) {
        seen.set(key, groups.length);
        groups.push({ key, label: dayLabel(item.sortDate), items: [] });
      }
      groups[seen.get(key)!].items.push(item);
    }
    return groups;
  }, [filtered]);

  const loading = loadingDiary || loadingPlants || loadingEvents || loadingEnv || loadingHarvest;
  const totalCount = allItems.length;

  function refreshAll() {
    refreshDiary();
    refreshEvents();
    refreshEnv();
    refreshHarvest();
  }

  return (
    <MotionPage>
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diário de Cultivo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount > 0
              ? `${totalCount} registro${totalCount > 1 ? "s" : ""} no total`
              : "Registro geral de todas as atividades"}
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={plants.length === 0}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          Novo Registro
        </Button>
      </div>
      </MotionItem>

      {/* Filters */}
      {totalCount > 0 && (
        <MotionItem>
        <div className="space-y-2">
          {/* Source filter */}
          <div className="flex gap-1.5 flex-wrap items-center">
            {SOURCE_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSourceFilter(s.value)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  sourceFilter === s.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Plant filter (only when diary or event selected or all) */}
          {plants.length > 1 && (sourceFilter === "all" || sourceFilter === "diary" || sourceFilter === "event") && (
            <div className="flex gap-1.5 flex-wrap items-center">
              <Filter size={12} className="text-muted-foreground/60" />
              <button
                onClick={() => setPlantFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  plantFilter === "all"
                    ? "bg-accent/10 border-accent/30 text-accent"
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
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
        </MotionItem>
      )}

      {/* Content */}
      <MotionItem>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-card" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="text-5xl">📖</span>
          <div>
            <h2 className="text-lg font-semibold">Diário vazio</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Todas as suas ações — regas, eventos, registros ambientais e colheitas — aparecem aqui automaticamente.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            disabled={plants.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Primeiro Registro
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          Nenhum registro com esses filtros.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
              </div>
              <div>
                {group.items.map((item) => (
                  <ActivityCard key={item.id} item={item} onDeleted={refreshAll} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </MotionItem>

      {/* New diary entry sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Novo Registro
            </SheetTitle>
          </SheetHeader>
          <DiaryForm
            plants={plants}
            fertilizers={fertilizers}
            defaultPlantId={plantFilter !== "all" ? plantFilter : plants[0]?.id}
            onSuccess={() => { setOpen(false); refreshDiary(); }}
            onCancel={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
    </MotionPage>
  );
}
