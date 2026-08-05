"use client";

import { useState, useMemo } from "react";
import { FlaskConical, Plus, Droplets, TrendingUp, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryEntryCard } from "@/components/diary/diary-entry-card";
import { FertilizerForm } from "@/components/nutrients/fertilizer-form";
import { FertilizerCard } from "@/components/nutrients/fertilizer-card";
import { useDiary } from "@/hooks/use-diary";
import { usePlants } from "@/hooks/use-plants";
import { useFertilizers } from "@/hooks/use-fertilizers";
import { format, parseISO, isToday, isYesterday, startOfWeek, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import type { DiaryEntry, Fertilizer } from "@/lib/types";

type ActiveSheet = "diary" | "fertilizer" | "edit-fertilizer";

export default function NutrientsPage() {
  const { entries, loading: loadingDiary, refresh: refreshDiary } = useDiary();
  const { plants, loading: loadingPlants } = usePlants();
  const { fertilizers, loading: loadingFertilizers, refresh: refreshFertilizers } = useFertilizers();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet | null>(null);
  const [editingFertilizer, setEditingFertilizer] = useState<Fertilizer | null>(null);
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

  function openEditFertilizer(f: Fertilizer) {
    setEditingFertilizer(f);
    setActiveSheet("edit-fertilizer");
  }

  return (
    <MotionPage>
    <div className="space-y-6 max-w-3xl mx-auto">
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
          onClick={() => setActiveSheet("diary")}
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

      {/* Arsenal de Fertilizantes */}
      <MotionItem>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Meu Arsenal</h2>
            {!loadingFertilizers && fertilizers.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {fertilizers.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setActiveSheet("fertilizer")}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Plus size={13} />
            Adicionar
          </button>
        </div>

        {loadingFertilizers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-card" />
            ))}
          </div>
        ) : fertilizers.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhum fertilizante cadastrado.</p>
            <button
              onClick={() => setActiveSheet("fertilizer")}
              className="text-xs text-primary hover:underline mt-1"
            >
              Adicionar o primeiro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fertilizers.map((f) => (
              <FertilizerCard
                key={f.id}
                fertilizer={f}
                onEdit={() => openEditFertilizer(f)}
                onDeleted={refreshFertilizers}
              />
            ))}
          </div>
        )}
      </div>
      </MotionItem>

      {/* Separator */}
      {nutrientEntries.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">Registros</span>
          <div className="flex-1 h-px bg-border" />
        </div>
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
          onAction={() => setActiveSheet("diary")}
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
                    onDeleted={refreshDiary}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </MotionItem>
    </div>

    {/* Diary Sheet */}
    <Sheet open={activeSheet === "diary"} onOpenChange={(o) => !o && setActiveSheet(null)}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <FlaskConical size={18} className="text-purple-400" />
            Registrar Nutrição
          </SheetTitle>
        </SheetHeader>
        <DiaryForm
          plants={plants}
          fertilizers={fertilizers}
          defaultType="nutrientes"
          defaultPlantId={plantFilter !== "all" ? plantFilter : plants[0]?.id}
          onSuccess={() => { setActiveSheet(null); refreshDiary(); }}
          onCancel={() => setActiveSheet(null)}
        />
      </SheetContent>
    </Sheet>

    {/* Add Fertilizer Sheet */}
    <Sheet open={activeSheet === "fertilizer"} onOpenChange={(o) => !o && setActiveSheet(null)}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <Package size={18} className="text-amber-400" />
            Adicionar Fertilizante
          </SheetTitle>
        </SheetHeader>
        <FertilizerForm
          onSuccess={() => { setActiveSheet(null); refreshFertilizers(); }}
          onCancel={() => setActiveSheet(null)}
        />
      </SheetContent>
    </Sheet>

    {/* Edit Fertilizer Sheet */}
    <Sheet open={activeSheet === "edit-fertilizer"} onOpenChange={(o) => { if (!o) { setActiveSheet(null); setEditingFertilizer(null); } }}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <Package size={18} className="text-amber-400" />
            Editar Fertilizante
          </SheetTitle>
        </SheetHeader>
        {editingFertilizer && (
          <FertilizerForm
            existing={editingFertilizer}
            onSuccess={() => { setActiveSheet(null); setEditingFertilizer(null); refreshFertilizers(); }}
            onCancel={() => { setActiveSheet(null); setEditingFertilizer(null); }}
          />
        )}
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
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
