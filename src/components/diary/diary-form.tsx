"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createEntry } from "@/lib/diary";
import { ENTRY_TYPES } from "@/lib/diary-constants";
import type { Plant, DiaryEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryFormProps {
  plants: Plant[];
  defaultPlantId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type EntryType = DiaryEntry["type"];

export function DiaryForm({ plants, defaultPlantId, onSuccess, onCancel }: DiaryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    plantId: defaultPlantId ?? plants[0]?.id ?? "",
    type: "rega" as EntryType,
    date: new Date().toISOString().slice(0, 16),
    notes: "",
    ph: "",
    ec: "",
    waterAmount: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.plantId) return;
    setLoading(true);
    setError(null);
    try {
      await createEntry(user.uid, {
        plantId: form.plantId,
        type: form.type,
        date: form.date,
        notes: form.notes.trim(),
        ph: form.ph ? Number(form.ph) : undefined,
        ec: form.ec ? Number(form.ec) : undefined,
        waterAmount: form.waterAmount ? Number(form.waterAmount) : undefined,
      });
      onSuccess();
    } catch {
      setError("Erro ao salvar registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const showWater = form.type === "rega" || form.type === "nutrientes";
  const showPhEc = form.type === "rega" || form.type === "nutrientes";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Planta */}
      {plants.length > 1 && (
        <div className="space-y-1.5">
          <Label>Planta</Label>
          <div className="flex flex-wrap gap-2">
            {plants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set("plantId", p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  form.plantId === p.id
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tipo */}
      <div className="space-y-1.5">
        <Label>Tipo de Registro</Label>
        <div className="grid grid-cols-3 gap-2">
          {ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("type", t.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all",
                form.type === t.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Data e Hora</Label>
        <Input
          id="date"
          type="datetime-local"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Campos por tipo */}
      {showPhEc && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ph">pH da água</Label>
            <Input
              id="ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              placeholder="Ex: 6.2"
              value={form.ph}
              onChange={(e) => set("ph", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          {form.type === "nutrientes" && (
            <div className="space-y-1.5">
              <Label htmlFor="ec">EC (mS/cm)</Label>
              <Input
                id="ec"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 1.4"
                value={form.ec}
                onChange={(e) => set("ec", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          )}
          {form.type === "rega" && (
            <div className="space-y-1.5">
              <Label htmlFor="waterAmount">Volume (mL)</Label>
              <Input
                id="waterAmount"
                type="number"
                min="0"
                placeholder="Ex: 500"
                value={form.waterAmount}
                onChange={(e) => set("waterAmount", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          )}
        </div>
      )}

      {/* Volume para nutrientes */}
      {form.type === "nutrientes" && (
        <div className="space-y-1.5">
          <Label htmlFor="waterAmountNutr">Volume (mL)</Label>
          <Input
            id="waterAmountNutr"
            type="number"
            min="0"
            placeholder="Ex: 1000"
            value={form.waterAmount}
            onChange={(e) => set("waterAmount", e.target.value)}
            className="bg-background border-border"
          />
        </div>
      )}

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder={
            form.type === "rega" ? "Ex: Planta absorveu bem, folhas firmes..." :
            form.type === "nutrientes" ? "Ex: Nutrientes da fase de floração, diluição 1:2..." :
            form.type === "poda" ? "Ex: Removidas folhas amareladas do baixeiro..." :
            form.type === "treinamento" ? "Ex: LST aplicado nos ramos laterais..." :
            form.type === "foto" ? "Descrição da foto..." :
            "Anotações gerais..."
          }
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="bg-background border-border min-h-[80px] resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.plantId}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Salvando..." : "Salvar Registro"}
        </Button>
      </div>
    </form>
  );
}
