"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePlants } from "@/hooks/use-plants";
import { useSpaces } from "@/hooks/use-spaces";
import { useEnvironment } from "@/hooks/use-environment";
import { useDiary } from "@/hooks/use-diary";
import { useGrowStyles } from "@/hooks/use-grow-styles";
import { useEvents } from "@/hooks/use-events";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { calcVPD } from "@/lib/environment";
import { STAGE_ENV_RANGES, STAGE_RANGE_LABELS, STAGE_RANGE_EMOJI } from "@/lib/env-ranges";
import type { GrowStage } from "@/lib/types";
import { STAGE_ORDER } from "@/lib/constants";
import { SpaceStatusCard } from "@/components/dashboard/space-status-card";
import { SpacePlantsSheet } from "@/components/dashboard/space-plants-sheet";
import { GrowCalendar } from "@/components/dashboard/grow-calendar";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import { HarvestCountdown } from "@/components/dashboard/harvest-countdown";
import { GrowStats } from "@/components/dashboard/grow-stats";
import { EnvChart } from "@/components/dashboard/env-chart";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, CalendarDays, Thermometer, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { WidgetVPD } from "@/components/dashboard/widget-vpd";
import { WidgetDLI } from "@/components/dashboard/widget-dli";
import { WidgetFlush } from "@/components/dashboard/widget-flush";
import { WidgetDiary } from "@/components/dashboard/widget-diary";
import { WidgetShopping } from "@/components/dashboard/widget-shopping";
import { WidgetQuickLog } from "@/components/dashboard/widget-quick-log";
import { useGCal } from "@/hooks/use-gcal";
import type { WidgetId } from "@/lib/dashboard-widgets";

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
  const { events } = useEvents();
  const { layout } = useDashboardLayout();
  const { isConnected: isGcalConnected } = useGCal();

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [selectedChartSpace, setSelectedChartSpace] = useState<string>("__all__");
  const [chartStage, setChartStage] = useState<GrowStage>("vegetativo");
  const [chartTab, setChartTab] = useState<"ambiente" | "agua">("ambiente");

  const firstName = user?.displayName?.split(" ")[0] ?? "Grower";
  const inFlower = plants.filter((p) => p.stage === "floracao").length;
  const inVeg = plants.filter((p) => p.stage === "vegetativo").length;

  const spacesWithPlants = useMemo(
    () => spaces.map((s) => ({ space: s, plants: plants.filter((p) => p.spaceId === s.id) })),
    [spaces, plants]
  );
  const unallocatedPlants = plants.filter((p) => !p.spaceId);

  const filteredRecords = useMemo(() => {
    if (selectedChartSpace === "__all__") return records;
    return records.filter((r) => r.spaceId === selectedChartSpace);
  }, [records, selectedChartSpace]);

  const chartRecords = useMemo(
    () => [...filteredRecords].reverse().slice(-14),
    [filteredRecords]
  );

  function toChartData(key: "temperature" | "humidity" | "co2") {
    return chartRecords.map((r) => ({ label: fmt(r.recordedAt), value: r[key] ?? null }));
  }

  const vpdData = useMemo(
    () =>
      chartRecords.map((r) => ({
        label: fmt(r.recordedAt),
        value:
          r.temperature != null && r.humidity != null
            ? calcVPD(r.temperature, r.humidity)
            : null,
      })),
    [chartRecords]
  );

  const filteredEntries = useMemo(() => {
    const withPh = entries.filter((e) => e.ph != null || e.phRunoff != null);
    if (selectedChartSpace === "__all__") return withPh.slice(-14).reverse();
    const spPlantIds = plants.filter((p) => p.spaceId === selectedChartSpace).map((p) => p.id);
    return withPh.filter((e) => spPlantIds.includes(e.plantId)).slice(-14).reverse();
  }, [entries, selectedChartSpace, plants]);

  const phInData = filteredEntries.map((e) => ({ label: fmt(e.date), value: e.ph ?? null }));
  const phOutData = filteredEntries.map((e) => ({ label: fmt(e.date), value: e.phRunoff ?? null }));

  const waterData = useMemo(() => {
    const spPlantIds = selectedChartSpace === "__all__"
      ? null
      : plants.filter((p) => p.spaceId === selectedChartSpace).map((p) => p.id);
    return entries
      .filter((e) =>
        (e.type === "rega" || e.type === "nutrientes") &&
        e.waterAmount != null &&
        (spPlantIds === null || spPlantIds.includes(e.plantId))
      )
      .slice(-20)
      .reverse()
      .map((e) => ({ label: fmt(e.date), value: e.waterAmount ?? null }));
  }, [entries, selectedChartSpace, plants]);
  const activeSheet = spacesWithPlants.find((s) => s.space.id === activeSpaceId);
  const loading = loadingPlants || loadingSpaces;

  const widgetMap: Partial<Record<WidgetId, React.ReactNode>> = {
    quick_stats: (
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
    ),

    grow_stats: <GrowStats plants={plants} events={events} />,

    week_calendar: <WeekCalendar events={events} plants={plants} />,

    harvest_countdown: <HarvestCountdown plants={plants} />,

    spaces:
      spaces.length > 0 || unallocatedPlants.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Ambientes Ativos
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
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
                      {unallocatedPlants.length}{" "}
                      {unallocatedPlants.length === 1 ? "planta" : "plantas"} não alocadas
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null,

    grow_calendar: (
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
    ),

    widget_vpd: <WidgetVPD />,

    widget_dli: <WidgetDLI />,

    widget_flush: <WidgetFlush plants={plants} />,

    widget_diary: <WidgetDiary entries={entries} plants={plants} />,

    widget_shopping: <WidgetShopping />,

    env_charts: (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1">
            <button
              onClick={() => setChartTab("ambiente")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartTab === "ambiente"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌡️ Ambiente
            </button>
            <button
              onClick={() => setChartTab("agua")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartTab === "agua"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💧 Água
            </button>
          </div>
          <div className="flex items-center gap-1.5">
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

        {/* Aba Ambiente */}
        {chartTab === "ambiente" && (
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
            <div className="grid grid-cols-2 gap-3">
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
        )}

        {/* Aba Água */}
        {chartTab === "agua" && (
          <div className="space-y-3">
            {/* Seletor de fase (pH ideal varia por fase) */}
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
            <div className="grid grid-cols-2 gap-3">
              <EnvChart title="pH Entrada (Run-in)" unit="" data={phInData} color="#eab308"
                refMin={STAGE_ENV_RANGES[chartStage].ph.min}
                refMax={STAGE_ENV_RANGES[chartStage].ph.max} />
              <EnvChart title="pH Saída (Run-off)" unit="" data={phOutData} color="#ec4899"
                refMin={STAGE_ENV_RANGES[chartStage].ph.min}
                refMax={STAGE_ENV_RANGES[chartStage].ph.max} />
              <EnvChart title="Volume de Rega" unit=" mL" data={waterData} color="#38bdf8" decimals={0}
                className="col-span-2" />
            </div>
          </div>
        )}
      </div>
    ),
  };

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

        {/* Quick log — always visible shortcut */}
        <MotionItem>
          <WidgetQuickLog
            plants={plants}
            isGcalConnected={isGcalConnected}
            onSaved={() => { }}
          />
        </MotionItem>

        {/* Dynamic widgets */}
        {layout.map((widgetId) => {
          const content = widgetMap[widgetId];
          if (!content) return null;
          return <MotionItem key={widgetId}>{content}</MotionItem>;
        })}

        {/* Space plants sheet — always mounted outside the layout loop */}
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
