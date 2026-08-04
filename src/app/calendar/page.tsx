"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, format, isSameDay, isSameMonth,
  addMonths, subMonths, isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEvents } from "@/hooks/use-events";
import { useGCal } from "@/hooks/use-gcal";
import { usePlants } from "@/hooks/use-plants";
import { deleteGrowEvent } from "@/lib/events";
import { EVENT_BY_TYPE } from "@/lib/event-constants";
import { EventSheet } from "@/components/calendar/event-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2,
  Wifi, WifiOff, Loader2, RefreshCw, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrowEvent } from "@/lib/types";
import type { GCalEvent } from "@/lib/gcal-client";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarPage() {
  const { events, loading, refresh } = useEvents();
  const { plants } = usePlants();
  const { isConnected, connect, disconnect, connecting, error: gcalError } = useGCal();

  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const [gcalLoading, setGcalLoading] = useState(false);

  const loadGCalEvents = useCallback(async (m: Date) => {
    setGcalLoading(true);
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    try {
      const res = await fetch(
        `/api/calendar/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`
      );
      const data = await res.json();
      if (data.expired) setGcalEvents([]);
      else setGcalEvents(data.events ?? []);
    } catch {
      setGcalEvents([]);
    } finally {
      setGcalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) loadGCalEvents(month);
    else setGcalEvents([]);
  }, [isConnected, month, loadGCalEvents]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, GrowEvent[]>();
    for (const ev of events) {
      const key = ev.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const gcalByDate = useMemo(() => {
    const map = new Map<string, GCalEvent[]>();
    for (const ev of gcalEvents) {
      const raw = ev.start.date ?? ev.start.dateTime ?? "";
      const key = raw.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [gcalEvents]);

  const plantMap = useMemo(
    () => Object.fromEntries(plants.map((p) => [p.id, p])),
    [plants]
  );

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedAppEvents = selectedKey ? (eventsByDate.get(selectedKey) ?? []) : [];
  const selectedGcalEvents = selectedKey ? (gcalByDate.get(selectedKey) ?? []) : [];

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteGrowEvent(id);
    await refresh();
    setDeleting(null);
  }

  return (
    <MotionPage>
    <div className="max-w-3xl mx-auto space-y-5 p-4 md:p-6">
      {/* Header */}
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays size={22} className="text-primary" />
            Calendário
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Eventos do cultivo + Google Agenda</p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          Evento
        </Button>
      </div>
      </MotionItem>

      {/* Google Calendar connection */}
      <MotionItem>
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isConnected
            ? <Wifi size={15} className="text-green-400 shrink-0" />
            : <WifiOff size={15} className="text-muted-foreground shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isConnected ? "Google Agenda sincronizada" : "Sincronizar com Google Agenda"}
            </p>
            {gcalError && <p className="text-xs text-destructive truncate">{gcalError}</p>}
            {!isConnected && !gcalError && (
              <p className="text-xs text-muted-foreground">Eventos criados aqui aparecem automaticamente na sua agenda</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 ml-3">
          {isConnected ? (
            <>
              <Button
                size="sm" variant="ghost"
                onClick={() => loadGCalEvents(month)}
                disabled={gcalLoading}
                className="gap-1 text-xs text-muted-foreground"
              >
                {gcalLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              </Button>
              <Button size="sm" variant="ghost" onClick={disconnect} className="text-xs text-muted-foreground">
                Desconectar
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={connect}
              disabled={connecting}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              {connecting ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
              {connecting ? "Conectando..." : "Conectar"}
            </Button>
          )}
        </div>
      </div>
      </MotionItem>

      {/* Month navigator */}
      <MotionItem>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-sm font-semibold capitalize">
            {format(month, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDate.get(key) ?? [];
              const dayGcal = gcalByDate.get(key) ?? [];
              const isCurrentMonth = isSameMonth(day, month);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isTodayDay = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "min-h-[52px] p-1 flex flex-col items-center gap-0.5 border-b border-r border-border/40 transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/20",
                    !isCurrentMonth && "opacity-30"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium",
                    (isTodayDay || isSelected) && "bg-primary text-primary-foreground",
                    !isTodayDay && !isSelected && "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <span key={i} className="text-[10px] leading-none">
                        {EVENT_BY_TYPE[ev.type]?.emoji ?? "📌"}
                      </span>
                    ))}
                    {dayGcal.length > 0 && (
                      <span className="text-[10px] leading-none">📅</span>
                    )}
                    {(dayEvents.length + dayGcal.length) > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{dayEvents.length + dayGcal.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </MotionItem>

      {/* Selected day */}
      {selected && (
        <MotionItem>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold capitalize">
              {format(selected, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setSheetOpen(true)}
              className="gap-1 text-xs text-muted-foreground hover:text-primary">
              <Plus size={13} /> Adicionar
            </Button>
          </div>

          {selectedAppEvents.length === 0 && selectedGcalEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum evento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {selectedAppEvents.map((ev) => {
                const meta = EVENT_BY_TYPE[ev.type];
                const eventPlants = (ev.plantIds ?? (ev.plantId ? [ev.plantId] : []))
                  .map((id) => plantMap[id])
                  .filter(Boolean);
                return (
                  <div key={ev.id} className={cn("flex items-start gap-3 p-3 rounded-xl border bg-card", meta?.bg ?? "border-border")}>
                    <span className="text-xl leading-none mt-0.5">{meta?.emoji ?? "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("text-sm font-medium", meta?.color)}>{meta?.label ?? ev.type}</p>
                        {ev.time && <span className="text-xs text-muted-foreground">{ev.time}</span>}
                        {ev.googleEventId && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">Google</span>
                        )}
                      </div>
                      {eventPlants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {eventPlants.map((p) => (
                            <span key={p.id} className="text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {ev.notes && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ev.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(ev.id)} disabled={deleting === ev.id}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

              {selectedGcalEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <span className="text-xl leading-none mt-0.5">📅</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-blue-400">{ev.summary}</p>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">Google</span>
                    </div>
                    {ev.start.dateTime && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(ev.start.dateTime), "HH:mm")}
                        {ev.end.dateTime && ` – ${format(new Date(ev.end.dateTime), "HH:mm")}`}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                  {ev.htmlLink && (
                    <a href={ev.htmlLink} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-blue-400 transition-colors p-1 shrink-0">
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </MotionItem>
      )}
    </div>

    <EventSheet
      open={sheetOpen}
      onClose={() => setSheetOpen(false)}
      onSaved={refresh}
      plants={plants}
      defaultDate={selected ? format(selected, "yyyy-MM-dd") : undefined}
      isGcalConnected={isConnected}
    />
    </MotionPage>
  );
}
