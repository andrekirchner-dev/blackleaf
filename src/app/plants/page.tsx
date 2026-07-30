"use client";

import { useState, useMemo } from "react";
import { Plus, Leaf, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plants/plant-card";
import { usePlants } from "@/hooks/use-plants";
import { Skeleton } from "@/components/ui/skeleton";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/constants";
import type { GrowStage } from "@/lib/types";

export default function PlantsPage() {
  const { plants, loading } = usePlants();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<GrowStage | "all">("all");

  const filtered = useMemo(() => {
    return plants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.strain.toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "all" || p.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [plants, search, stageFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {plants.length > 0 ? `${plants.length} planta${plants.length > 1 ? "s" : ""} no cultivo` : "Gerencie todas as plantas do seu cultivo"}
          </p>
        </div>
        <Link href="/plants/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            Nova Planta
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou strain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              stageFilter === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {STAGE_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                stageFilter === s
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-card" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => <PlantCard key={p.id} plant={p} />)}
        </div>
      ) : plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Leaf size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Nenhuma planta ainda</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Adicione sua primeira planta e comece a acompanhar seu cultivo com precisão.
            </p>
          </div>
          <Link href="/plants/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={16} />
              Adicionar Primeira Planta
            </Button>
          </Link>
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground text-sm">
          Nenhuma planta encontrada com esses filtros.
        </div>
      )}
    </div>
  );
}
