"use client";

import { useMemo } from "react";
import {
  differenceInDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  isFuture,
  isToday,
} from "date-fns";
import { TrendingUp, CalendarCheck, Clock, AlertTriangle } from "lucide-react";
import { EVENT_BY_TYPE } from "@/lib/event-constants";
import { cn } from "@/lib/utils";
import type { Plant, GrowEvent } from "@/lib/types";

interface Props {
  plants: Plant[];
  events: GrowEvent[];
}

interface StatCard {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  iconBg: string;
  valueColor?: string;
}

const FINAL_STAGES = new Set(["colheita", "secagem", "cura"] as const);

export function GrowStats({ plants, events }: Props) {
  const stats = useMemo<StatCard[]>(() => {
    const today = new Date();

    // 1. Dias do cultivo mais longo
    const activePlants = plants.filter((p) => p.germinationDate && !p.archived);
    let longestDays = 0;
    let longestPlantName = "";
    for (const p of activePlants) {
      const days = differenceInDays(today, parseISO(p.germinationDate));
      if (days > longestDays) {
        longestDays = days;
        longestPlantName = p.name;
      }
    }

    // 2. Eventos esta semana
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const lp = (n: number) => String(n).padStart(2, "0");
    const localDate = (d: Date) => `${d.getFullYear()}-${lp(d.getMonth()+1)}-${lp(d.getDate())}`;
    const weekStartStr = localDate(weekStart);
    const weekEndStr = localDate(weekEnd);
    const eventsThisWeek = events.filter((e) => {
      const d = e.date.slice(0, 10);
      return d >= weekStartStr && d <= weekEndStr;
    });

    // 3. Próxima ação — next future event (or today)
    const futureEvents = events
      .filter((e) => {
        const d = e.date.slice(0, 10);
        const eDate = parseISO(d);
        return isFuture(eDate) || isToday(eDate);
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    const nextEvent = futureEvents[0] ?? null;
    let nextLabel = "Nenhuma";
    let nextSublabel = "";
    if (nextEvent) {
      const meta = EVENT_BY_TYPE[nextEvent.type];
      const daysUntil = differenceInDays(parseISO(nextEvent.date.slice(0, 10)), today);
      nextLabel = `${meta?.emoji ?? ""} ${meta?.label ?? nextEvent.type}`;
      nextSublabel = daysUntil === 0 ? "hoje" : `em ${daysUntil} ${daysUntil === 1 ? "dia" : "dias"}`;
    }

    // 4. Plantas em atenção (estágios finais)
    const attentionPlants = plants.filter(
      (p) => !p.archived && FINAL_STAGES.has(p.stage as "colheita" | "secagem" | "cura")
    );

    return [
      {
        icon: <TrendingUp size={16} className="text-primary" />,
        value: longestDays > 0 ? `${longestDays}d` : "—",
        label: "Cultivo mais longo",
        sublabel: longestPlantName || undefined,
        iconBg: "bg-primary/10",
      },
      {
        icon: <CalendarCheck size={16} className="text-blue-400" />,
        value: String(eventsThisWeek.length),
        label: "Eventos esta semana",
        iconBg: "bg-blue-400/10",
      },
      {
        icon: <Clock size={16} className="text-accent" />,
        value: nextLabel,
        label: "Próxima ação",
        sublabel: nextSublabel || undefined,
        iconBg: "bg-accent/10",
        valueColor: nextEvent ? "text-foreground" : "text-muted-foreground",
      },
      {
        icon: <AlertTriangle size={16} className="text-orange-400" />,
        value: String(attentionPlants.length),
        label: "Em atenção",
        sublabel:
          attentionPlants.length > 0
            ? attentionPlants.map((p) => p.name).join(", ")
            : "Nenhuma em fase final",
        iconBg: "bg-orange-400/10",
        valueColor: attentionPlants.length > 0 ? "text-orange-400" : undefined,
      },
    ];
  }, [plants, events]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                stat.iconBg
              )}
            >
              {stat.icon}
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-bold leading-tight truncate",
                stat.valueColor ?? "text-foreground"
              )}
            >
              {stat.value}
            </p>
            {stat.sublabel && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {stat.sublabel}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
