"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createEntry } from "@/lib/diary";
import { ENTRY_TYPES } from "@/lib/diary-constants";
import { PRUNING_TYPES } from "@/lib/pruning-constants";
import type { Plant, DiaryEntry, Fertilizer, DiaryFertilizerUsage, PruningType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryFormProps {
  plants: Plant[];
  fertilizers?: Fertilizer[];
  defaultPlantId?: string;
  defaultType?: EntryType;
  onSuccess: () => void;
  onCancel: () => void;
}

type EntryType = DiaryEntry["type"];

function getStageDoseKey(stage: string): keyof NonNullable<Fertilizer["doses"]> {
  if (stage === "muda") return "muda";
  if (stage === "vegetativo") return "vegetativo";
  if (stage === "floracao") return "floracao_inicio";
  if (stage === "colheita") return "floracao_fim";
  if (stage === "secagem") return "floracao_fim";
  return "vegetativo";
}

export function DiaryForm({ plants, fertilizers = [], defaultPlantId, defaultType, onSuccess, onCancel }: DiaryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    plantId: defaultPlantId ?? plants[0]?.id ?? "",
    type: (defaultType ?? "rega") as EntryType,
    pruningType: "" as PruningType | "",
    date: (() => { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; })(),
    notes: "",
    ph: "",
    phRunoff: "",
    ec: "",
    waterAmount: "",
  });

  const [selectedFertilizers, setSelectedFertilizers] = useState<DiaryFertilizerUsage[]>([]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const selectedPlant = plants.find((p) => p.id === form.plantId);

  function toggleFertilizer(f: Fertilizer) {
    setSelectedFertilizers((prev) => {
      const exists = prev.find((u) => u.fertilizerId === f.id);
      if (exists) {
        return prev.filter((u) => u.fertilizerId !== f.id);
      }
      const stageKey = selectedPlant ? getStageDoseKey(selectedPlant.stage) : "vegetativo";
      const suggestedDose = f.doses?.[stageKey] ?? 0;
      return [...prev, { fertilizerId: f.id, name: f.name, mlPerLiter: suggestedDose }];
    });
  }

  function updateDose(fertilizerId: string, value: string) {
    setSelectedFertilizers((prev) =>
      prev.map((u) =>
        u.fertilizerId === fertilizerId
          ? { ...u, mlPerLiter: Number(value) || 0 }
          : u
      )
    );
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
        pruningType: form.type === "poda" && form.pruningType ? form.pruningType : undefined,
        date: form.date,
        notes: form.notes.trim(),
        ph: form.ph ? Number(form.ph) : undefined,
        phRunoff: form.phRunoff ? Number(form.phRunoff) : undefined,
        ec: form.ec ? Number(form.ec) : undefined,
        waterAmount: form.waterAmount ? Number(form.waterAmount) : undefined,
        fertilizersUsed: selectedFertilizers.length > 0 ? selectedFertilizers : undefined,
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
  const showFertilizers = form.type === "nutrientes" && fertilizers.length > 0;

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
              onClick={() => { set("type", t.value); set("pruningType", ""); }}
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

      {/* Pruning sub-type */}
      {form.type === "poda" && (
        <div className="space-y-1.5">
          <Label>Tipo de Poda</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRUNING_TYPES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => set("pruningType", form.pruningType === p.value ? "" : p.value)}
                className={cn(
                  "flex flex-col items-start gap-0.5 py-2 px-3 rounded-xl border text-left transition-all",
                  form.pruningType === p.value
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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ph">pH entrada (Run-in)</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="phRunoff">pH saída (Run-off)</Label>
              <Input
                id="phRunoff"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="Ex: 6.8"
                value={form.phRunoff}
                onChange={(e) => set("phRunoff", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      )}

      {/* Fertilizantes */}
      {showFertilizers && (
        <div className="space-y-2">
          <Label>Fertilizantes utilizados</Label>
          <div className="space-y-1.5">
            {fertilizers.map((f) => {
              const selected = selectedFertilizers.find((u) => u.fertilizerId === f.id);
              const stageKey = selectedPlant ? getStageDoseKey(selectedPlant.stage) : "vegetativo";
              const suggested = f.doses?.[stageKey];
              return (
                <div key={f.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleFertilizer(f)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all",
                      selected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-background border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {selected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{f.name}</span>
                      {f.brand && (
                        <span className="text-xs text-muted-foreground shrink-0">{f.brand}</span>
                      )}
                    </div>
                    {suggested != null && !selected && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {suggested} mL/L
                      </span>
                    )}
                  </button>

                  {selected && (
                    <div className="flex items-center gap-2 pl-3">
                      <span className="text-xs text-muted-foreground flex-1">Dose (mL/L):</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={selected.mlPerLiter || ""}
                        onChange={(e) => updateDose(f.id, e.target.value)}
                        className="bg-background border-border w-24 h-7 text-sm text-right"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs text-muted-foreground">mL/L</span>
                      {suggested != null && (
                        <button
                          type="button"
                          onClick={() => updateDose(f.id, suggested.toString())}
                          className="text-xs text-primary hover:underline shrink-0"
                        >
                          Sugerido: {suggested}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
