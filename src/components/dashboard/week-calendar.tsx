"use client";

import { useMemo } from "react";
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  isToday, isPast, isFuture, format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { EVENT_BY_TYPE } from "@/lib/event-constants";
import type { GrowEvent, Plant } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  events: GrowEvent[];
  plants: Plant[];
}

const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function WeekCalendar({ events, plants }: Props) {
  const plantMap = useMemo(
    () => Object.fromEntries(plants.map((p) => [p.id, p])),
    [plants]
  );

  const weekDays = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 0 });
    const end = endOfWeek(now, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, []);

  const eventsByDate = useMemo(() => {
    const weekKeys = new Set(weekDays.map((d) => format(d, "yyyy-MM-dd")));
    const map = new Map<string, GrowEvent[]>();
    for (const ev of events) {
      const key = ev.date.slice(0, 10);
      if (!weekKeys.has(key)) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events, weekDays]);

  const pendingDays = useMemo(
    () =>
      weekDays.filter((d) => {
        if (!isToday(d) && !isFuture(d)) return false;
        const key = format(d, "yyyy-MM-dd");
        return (eventsByDate.get(key) ?? []).length > 0;
      }),
    [weekDays, eventsByDate]
  );

  const doneDays = useMemo(
    () =>
      weekDays.filter((d) => {
        if (!isPast(d) || isToday(d)) return false;
        const key = format(d, "yyyy-MM-dd");
        return (eventsByDate.get(key) ?? []).length > 0;
      }),
    [weekDays, eventsByDate]
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Esta Semana</h3>
        <Link href="/calendar" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Calendário completo →
        </Link>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {weekDays.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvs = eventsByDate.get(key) ?? [];
          const isTodayDay = isToday(day);
          const isPastDay = isPast(day) && !isTodayDay;

          return (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center py-3 gap-1",
                isTodayDay && "bg-primary/5"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold",
                isTodayDay ? "text-primary" : "text-muted-foreground/50"
              )}>
                {DAY_INITIALS[i]}
              </span>

              <span className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold",
                isTodayDay
                  ? "bg-primary text-primary-foreground"
                  : isPastDay
                  ? "text-muted-foreground/40"
                  : "text-foreground"
              )}>
                {format(day, "d")}
              </span>

              <div className="flex flex-col items-center gap-0.5 min-h-[24px] justify-center">
                {dayEvs.slice(0, 2).map((ev) => (
                  <span
                    key={ev.id}
                    className={cn("text-[12px] leading-none", isPastDay && "opacity-30")}
                  >
                    {EVENT_BY_TYPE[ev.type]?.emoji ?? "📌"}
                  </span>
                ))}
                {dayEvs.length > 2 && (
                  <span className={cn("text-[9px]", isPastDay ? "text-muted-foreground/30" : "text-muted-foreground")}>
                    +{dayEvs.length - 2}
                  </span>
                )}
              </div>

              {dayEvs.length > 0 && (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isPastDay
                    ? "bg-primary/25"
                    : isTodayDay
                    ? "bg-primary"
                    : "bg-accent"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Pending events */}
      {pendingDays.length > 0 && (
        <div className="divide-y divide-border/30">
          {pendingDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvs = eventsByDate.get(key) ?? [];
            return (
              <div key={key} className="px-4 py-2.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {isToday(day) ? "Hoje" : format(day, "EEE dd/MM", { locale: ptBR })}
                </p>
                <div className="space-y-1.5">
                  {dayEvs.map((ev) => {
                    const meta = EVENT_BY_TYPE[ev.type];
                    const evPlants = (ev.plantIds ?? (ev.plantId ? [ev.plantId] : []))
                      .map((id) => plantMap[id])
                      .filter(Boolean);
                    return (
                      <div key={ev.id} className="flex items-center gap-2">
                        <span className="text-sm leading-none">{meta?.emoji ?? "📌"}</span>
                        <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
                          <span className={cn("text-xs font-medium", meta?.color ?? "text-foreground")}>
                            {meta?.label ?? ev.type}
                          </span>
                          {evPlants.length > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              · {evPlants.map((p) => p.name).join(", ")}
                            </span>
                          )}
                        </div>
                        {ev.time && (
                          <span className="text-[11px] text-muted-foreground shrink-0">{ev.time}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Done this week */}
      {doneDays.length > 0 && (
        <div className="border-t border-border/40 px-4 py-2.5">
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wide mb-1.5">
            Feito esta semana
          </p>
          <div className="flex flex-wrap gap-1.5">
            {doneDays.flatMap((day) => {
              const key = format(day, "yyyy-MM-dd");
              return (eventsByDate.get(key) ?? []).map((ev) => {
                const meta = EVENT_BY_TYPE[ev.type];
                return (
                  <span
                    key={ev.id}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/50 bg-muted/20 px-2 py-0.5 rounded-full"
                  >
                    <span className="opacity-50">{meta?.emoji ?? "📌"}</span>
                    {meta?.label ?? ev.type}
                    <span className="text-primary/50">✓</span>
                  </span>
                );
              });
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pendingDays.length === 0 && doneDays.length === 0 && (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhum evento esta semana</p>
          <Link href="/calendar" className="text-xs text-primary mt-1 block hover:underline">
            Adicionar evento →
          </Link>
        </div>
      )}
    </div>
  );
}
