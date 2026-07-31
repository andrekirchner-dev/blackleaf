"use client";

import { useState, useMemo } from "react";
import { BookOpen, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryEntryCard } from "@/components/diary/diary-entry-card";
import { useDiary } from "@/hooks/use-diary";
import { usePlants } from "@/hooks/use-plants";
import { ENTRY_TYPES } from "@/lib/diary-constants";
import type { DiaryEntry } from "@/lib/types";
import { format, parseISO, isToday, isYesterday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

export default function DiaryPage() {
  const { entries, loading: loadingDiary, refresh } = useDiary();
  const { plants, loading: loadingPlants } = usePlants();
  const [open, setOpen] = useState(false);
  const [plantFilter, setPlantFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchPlant = plantFilter === "all" || e.plantId === plantFilter;
      const matchType = typeFilter === "all" || e.type === typeFilter;
      return matchPlant && matchType;
    });
  }, [entries, plantFilter, typeFilter]);

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
          <h1 className="text-2xl font-bold">Diário de Cultivo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {entries.length > 0
              ? `${entries.length} registro${entries.length > 1 ? "s" : ""} no total`
              : "Registre regas, nutrições e observações"}
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
      <MotionItem>
      {(plants.length > 0 || entries.length > 0) && (
        <div className="space-y-2">
          {/* Plant filter */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <Filter size={13} className="text-muted-foreground" />
            <button
              onClick={() => setPlantFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                plantFilter === "all"
                  ? "bg-primary/10 border-primary/30 text-primary"
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
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                typeFilter === "all"
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              Todos os tipos
            </button>
            {ENTRY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all gap-1 flex items-center",
                  typeFilter === t.value
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      </MotionItem>

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
          emoji="🌿"
          title="Nenhuma planta cadastrada"
          description="Cadastre uma planta primeiro para começar a usar o diário."
          href="/plants/new"
          actionLabel="Cadastrar Planta"
        />
      ) : entries.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="Diário vazio"
          description="Registre sua primeira rega, nutrição ou observação."
          onAction={() => setOpen(true)}
          actionLabel="Primeiro Registro"
        />
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          Nenhum registro com esses filtros.
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

      {/* New entry sheet */}
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
            defaultPlantId={plantFilter !== "all" ? plantFilter : plants[0]?.id}
            onSuccess={() => { setOpen(false); refresh(); }}
            onCancel={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
    </MotionPage>
  );
}

function EmptyState({
  emoji, title, description, href, onAction, actionLabel,
}: {
  emoji: string;
  title: string;
  description: string;
  href?: string;
  onAction?: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <span className="text-5xl">{emoji}</span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      </div>
      {href ? (
        <a href={href}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">{actionLabel}</Button>
        </a>
      ) : (
        <Button onClick={onAction} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
