"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGrowEvent } from "@/lib/events";
import { GROW_EVENT_TYPES } from "@/lib/event-constants";
import { useAuth } from "@/contexts/auth-context";
import type { Plant, GrowEventType } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  plants: Plant[];
  defaultDate?: string;
  isGcalConnected?: boolean;
}

export function EventSheet({ open, onClose, onSaved, plants, defaultDate, isGcalConnected }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<GrowEventType>("rega");
  const [plantId, setPlantId] = useState("");
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [gcalSynced, setGcalSynced] = useState(false);

  const selectedType = GROW_EVENT_TYPES.find((t) => t.value === type)!;

  function resetForm() {
    setNotes("");
    setTime("");
    setPlantId("");
    setError(null);
    setSaved(false);
    setGcalSynced(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const plantName = plantId ? plants.find((p) => p.id === plantId)?.name : undefined;
      const title = `${selectedType.emoji} ${selectedType.label}${plantName ? ` — ${plantName}` : ""}`;

      const eventId = await createGrowEvent(user.uid, {
        type,
        plantId: plantId || undefined,
        date,
        time: time || undefined,
        notes: notes.trim() || undefined,
      });

      let synced = false;
      if (isGcalConnected) {
        const res = await fetch("/api/calendar/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, title, date, time: time || undefined, notes: notes.trim() || undefined }),
        });
        const data = await res.json();
        synced = data.ok === true;
      }

      onSaved();
      setGcalSynced(synced);
      setSaved(true);
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
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Evento</Label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {GROW_EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
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

            {plants.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="ev-plant">Planta (opcional)</Label>
                <select
                  id="ev-plant"
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Nenhuma planta vinculada</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.strain}</option>
                  ))}
                </select>
              </div>
            )}

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
