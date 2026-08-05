"use client";

import { useState, useMemo } from "react";
import { FlaskConical, Plus, Droplets, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryEntryCard } from "@/components/diary/diary-entry-card";
import { useDiary } from "@/hooks/use-diary";
import { usePlants } from "@/hooks/use-plants";
import { format, parseISO, isToday, isYesterday, startOfWeek, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import type { DiaryEntry } from "@/lib/types";

export default function NutrientsPage() {
  const { entries, loading: loadingDiary, refresh } = useDiary();
  const { plants, loading: loadingPlants } = usePlants();
  const [open, setOpen] = useState(false);
  const [plantFilter, setPlantFilter] = useState<string>("all");

  const nutrientEntries = useMemo(
    () => entries.filter((e) => e.type === "nutrientes"),
    [entries]
  );

  const filtered = useMemo(
    () =>
      plantFilter === "all"
        ? nutrientEntries
        : nutrientEntries.filter((e) => e.plantId === plantFilter),
    [nutrientEntries, plantFilter]
  );

  // Stats: this week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const thisWeek = nutrientEntries.filter((e) => {
    try { return isAfter(parseISO(e.date), weekStart); } catch { return false; }
  });

  const avgPh = useMemo(() => {
    const vals = filtered.filter((e) => e.ph != null).map((e) => e.ph!);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }, [filtered]);

  const avgEc = useMemo(() => {
    const vals = filtered.filter((e) => e.ec != null).map((e) => e.ec!);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }, [filtered]);

  // Group by day
  const grouped = useMemo(() => {
    const groups: { label: string; entries: DiaryEntry[] }[] = [];
    const seen = new Map<string, number>();
    for (const entry of filtered) {
      let dateObj: Date;
      try { dateObj = parseISO(entry.date); } catch { continue; }
      const key = format(dateObj, "yyyy-MM-dd");
      if (!seen.has(key)) {
        const label = isToday(dateObj)
          ? "Hoje"
          : isYesterday(dateObj)
          ? "Ontem"
          : format(dateObj, "dd 'de' MMMM", { locale: ptBR });
        seen.set(key, groups.length);
        groups.push({ label, entries: [] });
      }
      groups[seen.get(key)!].entries.push(entry);
    }
    return groups;
  }, [filtered]);

  const plantMap = useMemo(
    () => Object.fromEntries(plants.map((p) => [p.id, p])),
    [plants]
  );

  const loading = loadingDiary || loadingPlants;

  return (
    <MotionPage>
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical size={22} className="text-purple-400" />
            Nutrição
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            pH, EC e registros de nutrientes por planta
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={plants.length === 0}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          Registrar
        </Button>
      </div>
      </MotionItem>

      {/* Stats */}
      {!loading && nutrientEntries.length > 0 && (
        <MotionItem>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0">
              <FlaskConical size={14} className="text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{thisWeek.length}</p>
              <p className="text-[11px] text-muted-foreground">Esta semana</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
              <Droplets size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {avgPh != null ? avgPh.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">pH médio</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {avgEc != null ? avgEc.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">EC médio</p>
            </div>
          </div>
        </div>
        </MotionItem>
      )}

      {/* Plant filter */}
      {!loading && plants.length > 1 && nutrientEntries.length > 0 && (
        <MotionItem>
        <div className="flex gap-1.5 flex-wrap items-center">
          <Filter size={13} className="text-muted-foreground shrink-0" />
          <button
            onClick={() => setPlantFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
              plantFilter === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Todas
          </button>
          {plants
            .filter((p) => nutrientEntries.some((e) => e.plantId === p.id))
            .map((p) => (
              <button
                key={p.id}
                onClick={() => setPlantFilter(p.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  plantFilter === p.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
        </div>
        </MotionItem>
      )}

      {/* Content */}
      <MotionItem>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-card" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <EmptyState
          title="Nenhuma planta cadastrada"
          description="Cadastre uma planta primeiro para registrar nutrição."
          href="/plants/new"
          actionLabel="Cadastrar Planta"
        />
      ) : nutrientEntries.length === 0 ? (
        <EmptyState
          title="Nenhum registro de nutrição"
          description="Registre pH, EC e os nutrientes usados no seu cultivo."
          onAction={() => setOpen(true)}
          actionLabel="Primeiro Registro"
        />
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          Nenhum registro para esta planta.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{group.entries.length}</span>
              </div>
              <div>
                {group.entries.map((entry) => (
                  <DiaryEntryCard
                    key={entry.id}
                    entry={entry}
                    plant={plantMap[entry.plantId]}
                    onDeleted={refresh}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </MotionItem>
    </div>

    {/* Sheet */}
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <FlaskConical size={18} className="text-purple-400" />
            Registrar Nutrição
          </SheetTitle>
        </SheetHeader>
        <DiaryForm
          plants={plants}
          defaultType="nutrientes"
          defaultPlantId={plantFilter !== "all" ? plantFilter : plants[0]?.id}
          onSuccess={() => { setOpen(false); refresh(); }}
          onCancel={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
    </MotionPage>
  );
}

function EmptyState({
  title,
  description,
  href,
  onAction,
  actionLabel,
}: {
  title: string;
  description: string;
  href?: string;
  onAction?: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
        <FlaskConical size={28} className="text-purple-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      </div>
      {href ? (
        <a href={href}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            {actionLabel}
          </Button>
        </a>
      ) : (
        <Button
          onClick={onAction}
          className="gap-primary text-primary-foreground hover:bg-primary/90 gap-2 bg-primary"
        >
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
