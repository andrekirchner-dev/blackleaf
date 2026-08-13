"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGrowEvent } from "@/lib/events";
import { GROW_EVENT_TYPES } from "@/lib/event-constants";
import { PRUNING_TYPES } from "@/lib/pruning-constants";
import { useAuth } from "@/contexts/auth-context";
import type { Plant, GrowEventType, PruningType } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  plants: Plant[];
  defaultDate?: string;
  defaultTime?: string;
  defaultType?: GrowEventType;
  isGcalConnected?: boolean;
}

export function EventSheet({ open, onClose, onSaved, plants, defaultDate, defaultTime, defaultType, isGcalConnected }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<GrowEventType>(defaultType ?? "rega");
  const [pruningType, setPruningType] = useState<PruningType | "">("");
  const [plantIds, setPlantIds] = useState<string[]>([]);
  const [date, setDate] = useState(defaultDate ?? localDateStr());
  const [time, setTime] = useState(defaultTime ?? "");

  // Re-apply defaults each time the sheet opens (quick log passes different type each time)
  useEffect(() => {
    if (open) {
      setType(defaultType ?? "rega");
      setPruningType("");
      setTime(defaultTime ?? "");
      setDate(defaultDate ?? localDateStr());
      setPlantIds([]);
      setNotes("");
      setSaved(false);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [gcalSynced, setGcalSynced] = useState(false);

  const selectedType = GROW_EVENT_TYPES.find((t) => t.value === type)!;

  function togglePlant(id: string) {
    setPlantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function resetForm() {
    setNotes("");
    setTime("");
    setPlantIds([]);
    setError(null);
    setSaved(false);
    setGcalSynced(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const selectedPlants = plants.filter((p) => plantIds.includes(p.id));
      const plantLabel = selectedPlants.length > 0
        ? ` — ${selectedPlants.map((p) => p.name).join(", ")}`
        : "";
      const title = `${selectedType.emoji} ${selectedType.label}${plantLabel}`;

      const eventId = await createGrowEvent(user.uid, {
        type,
        pruningType: type === "poda" && pruningType ? pruningType : undefined,
        plantIds: plantIds.length > 0 ? plantIds : undefined,
        plantId: plantIds[0] || undefined,
        date,
        time: time || undefined,
        notes: notes.trim() || undefined,
      });

      // Firestore save confirmed — notify parent and show success immediately.
      // GCal sync is attempted separately and never blocks or reverts the save.
      onSaved();
      setSaved(true);

      if (isGcalConnected) {
        try {
          const res = await fetch("/api/calendar/push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, title, date, time: time || undefined, notes: notes.trim() || undefined }),
          });
          const data = await res.json();
          setGcalSynced(data.ok === true);
        } catch {
          // GCal sync failure is silent — the event is already persisted.
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92dvh] overflow-y-auto bg-card border-border pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base font-semibold">Novo Evento</SheetTitle>
        </SheetHeader>

        {saved ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Evento salvo!</p>
                {gcalSynced && (
                  <p className="text-xs text-muted-foreground mt-0.5">Sincronizado com o Google Agenda ✓</p>
                )}
              </div>
            </div>
            <Button type="button" onClick={handleClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Event type grid */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Evento</Label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {GROW_EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setType(t.value); setPruningType(""); }}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-[11px] font-medium transition-all",
                      type === t.value
                        ? `${t.bg} border-current`
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-lg leading-none">{t.emoji}</span>
                    <span className={type === t.value ? t.color : ""}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pruning sub-type (only when poda is selected) */}
            {type === "poda" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Poda</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRUNING_TYPES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPruningType(pruningType === p.value ? "" : p.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 py-2 px-3 rounded-xl border text-left transition-all",
                        pruningType === p.value
                          ? "bg-orange-400/10 border-orange-400/40 text-orange-400"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-[11px] font-semibold">{p.label}</span>
                      <span className="text-[10px] leading-tight opacity-70">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ev-date">Data *</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-time">Horário (opcional)</Label>
                <Input
                  id="ev-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Plants multi-select */}
            {plants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Plantas (opcional)
                  {plantIds.length > 0 && (
                    <span className="ml-2 normal-case text-primary font-medium">
                      {plantIds.length} selecionada{plantIds.length > 1 ? "s" : ""}
                    </span>
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {plants.map((p) => {
                    const selected = plantIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlant(p.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                          selected
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        )}
                      >
                        {selected && <span className="text-[10px]">✓</span>}
                        <span>{p.name}</span>
                        {p.strain && <span className="opacity-60">· {p.strain}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="ev-notes">Observações (opcional)</Label>
              <Textarea
                id="ev-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: pH 6.2, EC 1.4, 2L por planta..."
                className="bg-background border-border min-h-[70px] resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 border-border">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !date}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : "Salvar Evento"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
