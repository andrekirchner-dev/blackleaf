"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePlants } from "@/hooks/use-plants";
import { useSpaces } from "@/hooks/use-spaces";
import { useEnvironment } from "@/hooks/use-environment";
import { useDiary } from "@/hooks/use-diary";
import { useGrowStyles } from "@/hooks/use-grow-styles";
import { calcVPD } from "@/lib/environment";
import { SpaceStatusCard } from "@/components/dashboard/space-status-card";
import { SpacePlantsSheet } from "@/components/dashboard/space-plants-sheet";
import { GrowCalendar } from "@/components/dashboard/grow-calendar";
import { EnvChart } from "@/components/dashboard/env-chart";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, CalendarDays, Thermometer, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

function fmt(date: string) {
  try {
    return format(new Date(date), "dd/MM", { locale: ptBR });
  } catch {
    return date.slice(5, 10);
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { plants, loading: loadingPlants, refresh: refreshPlants } = usePlants();
  const { spaces, loading: loadingSpaces } = useSpaces();
  const { records } = useEnvironment();
  const { entries, refresh: refreshDiary } = useDiary();
  const { styles } = useGrowStyles();

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [selectedChartSpace, setSelectedChartSpace] = useState<string>("__all__");

  const firstName = user?.displayName?.split(" ")[0] ?? "Grower";

  const inFlower = plants.filter((p) => p.stage === "floracao").length;
  const inVeg = plants.filter((p) => p.stage === "vegetativo").length;

  // Spaces with plants
  const spacesWithPlants = useMemo(
    () => spaces.map((s) => ({
      space: s,
      plants: plants.filter((p) => p.spaceId === s.id),
    })),
    [spaces, plants]
  );

  const unallocatedPlants = plants.filter((p) => !p.spaceId);

  // Build chart data (last 14 readings for the selected space)
  const filteredRecords = useMemo(() => {
    if (selectedChartSpace === "__all__") return records;
    return records.filter((r) => r.spaceId === selectedChartSpace);
  }, [records, selectedChartSpace]);

  const chartRecords = useMemo(
    () => [...filteredRecords].reverse().slice(-14),
    [filteredRecords]
  );

  function toChartData(key: "temperature" | "humidity" | "co2") {
    return chartRecords.map((r) => ({
      label: fmt(r.recordedAt),
      value: r[key] ?? null,
    }));
  }

  const vpdData = useMemo(() => chartRecords.map((r) => ({
    label: fmt(r.recordedAt),
    value:
      r.temperature != null && r.humidity != null
        ? calcVPD(r.temperature, r.humidity)
        : null,
  })), [chartRecords]);

  // pH run-in / run-off from diary
  const filteredEntries = useMemo(() => {
    const withPh = entries.filter((e) => e.ph != null || e.phRunoff != null);
    if (selectedChartSpace === "__all__") return withPh.slice(-14).reverse();
    const spaceObj = spaces.find((s) => s.id === selectedChartSpace);
    if (!spaceObj) return withPh.slice(-14).reverse();
    const spPlantIds = plants.filter((p) => p.spaceId === selectedChartSpace).map((p) => p.id);
    return withPh.filter((e) => spPlantIds.includes(e.plantId)).slice(-14).reverse();
  }, [entries, selectedChartSpace, spaces, plants]);

  const phInData = filteredEntries.map((e) => ({
    label: fmt(e.date),
    value: e.ph ?? null,
  }));

  const phOutData = filteredEntries.map((e) => ({
    label: fmt(e.date),
    value: e.phRunoff ?? null,
  }));

  const activeSheet = spacesWithPlants.find((s) => s.space.id === activeSpaceId);

  const loading = loadingPlants || loadingSpaces;

  return (
    <MotionPage>
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Painel do seu cultivo</p>
        </div>
        <Link href="/plants/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            Nova Planta
          </Button>
        </Link>
      </div>
      </MotionItem>

      {/* Quick stats */}
      <MotionItem>
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-muted" />
          ))
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Leaf size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{plants.length}</p>
                <p className="text-xs text-muted-foreground">Plantas</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-400/10 flex items-center justify-center shrink-0">
                <Sun size={16} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{inFlower}</p>
                <p className="text-xs text-muted-foreground">Em Floração</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-lime-400/10 flex items-center justify-center shrink-0">
                <CalendarDays size={16} className="text-lime-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{inVeg}</p>
                <p className="text-xs text-muted-foreground">Vegetativo</p>
              </div>
            </div>
          </>
        )}
      </div>
      </MotionItem>

      {/* Active Spaces */}
      <MotionItem>
      {(spaces.length > 0 || unallocatedPlants.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Ambientes Ativos
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {loadingSpaces ? (
              Array.from({ length: 2 }, (_, i) => (
                <Skeleton key={i} className="w-52 h-28 shrink-0 rounded-2xl bg-muted" />
              ))
            ) : (
              <>
                {spacesWithPlants.map(({ space, plants: sPlants }) => (
                  <SpaceStatusCard
                    key={space.id}
                    space={space}
                    plants={sPlants}
                    onClick={() => setActiveSpaceId(space.id)}
                  />
                ))}
                {unallocatedPlants.length > 0 && (
                  <div className="flex-shrink-0 w-52 bg-card border border-dashed border-border rounded-2xl p-4">
                    <span className="text-2xl block mb-2">🌿</span>
                    <p className="text-sm font-semibold text-foreground">Sem espaço</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {unallocatedPlants.length} {unallocatedPlants.length === 1 ? "planta" : "plantas"} não alocadas
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </MotionItem>

      {/* Grow Calendar */}
      <MotionItem>
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Calendário de Cultivo
        </h2>
        {loadingPlants ? (
          <Skeleton className="h-40 rounded-2xl bg-muted" />
        ) : (
          <GrowCalendar plants={plants} styles={styles} />
        )}
      </div>
      </MotionItem>

      {/* Environmental Charts */}
      <MotionItem>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Ambiente
          </h2>
          <div className="flex items-center gap-1.5">
            <Thermometer size={13} className="text-muted-foreground" />
            <select
              value={selectedChartSpace}
              onChange={(e) => setSelectedChartSpace(e.target.value)}
              className="bg-background border border-border rounded-lg text-xs px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="__all__">Todos os espaços</option>
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Link href="/environment">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
                Registrar
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <EnvChart
            title="Temperatura"
            unit="°C"
            data={toChartData("temperature")}
            color="#f97316"
            refMin={20}
            refMax={28}
          />
          <EnvChart
            title="Umidade"
            unit="%"
            data={toChartData("humidity")}
            color="#3b82f6"
            refMin={40}
            refMax={70}
            decimals={0}
          />
          <EnvChart
            title="VPD"
            unit=" kPa"
            data={vpdData}
            color="#a855f7"
            refMin={0.4}
            refMax={1.2}
          />
          <EnvChart
            title="CO₂"
            unit=" ppm"
            data={toChartData("co2")}
            color="#22c55e"
            refMin={700}
            refMax={1500}
            decimals={0}
          />
          <EnvChart
            title="pH Entrada (Run-in)"
            unit=""
            data={phInData}
            color="#eab308"
            refMin={5.8}
            refMax={6.8}
          />
          <EnvChart
            title="pH Saída (Run-off)"
            unit=""
            data={phOutData}
            color="#ec4899"
            refMin={5.8}
            refMax={6.8}
          />
        </div>
      </div>
      </MotionItem>

      {/* Space plants sheet */}
      {activeSheet && (
        <SpacePlantsSheet
          space={activeSheet.space}
          plants={activeSheet.plants}
          open={!!activeSpaceId}
          onClose={() => setActiveSpaceId(null)}
          onDiarySuccess={() => {
            refreshPlants();
            refreshDiary();
          }}
        />
      )}
    </div>
    </MotionPage>
  );
}
