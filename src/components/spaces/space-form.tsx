"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSpace, updateSpace } from "@/lib/spaces";
import { SPACE_TYPES, LIGHT_TYPES, LIGHT_SCHEDULES } from "@/lib/space-constants";
import type { GrowSpace, SpaceType, LightType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceFormProps {
  space?: GrowSpace;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpaceForm({ space, onSuccess, onCancel }: SpaceFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: space?.name ?? "",
    type: (space?.type ?? "tenda") as SpaceType,
    widthCm: space?.widthCm?.toString() ?? "",
    depthCm: space?.depthCm?.toString() ?? "",
    heightCm: space?.heightCm?.toString() ?? "",
    lightType: (space?.lightType ?? "led") as LightType,
    lightWatts: space?.lightWatts?.toString() ?? "",
    lightSchedule: space?.lightSchedule ?? "18/6",
    ventInputs: space?.ventInputs?.toString() ?? "1",
    ventOutputs: space?.ventOutputs?.toString() ?? "1",
    notes: space?.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.name.trim()) {
      setError("Nome do espaço é obrigatório.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        widthCm: Number(form.widthCm) || 0,
        depthCm: Number(form.depthCm) || 0,
        heightCm: Number(form.heightCm) || 0,
        lightType: form.lightType,
        lightWatts: form.lightWatts ? Number(form.lightWatts) : undefined,
        lightSchedule: form.lightSchedule,
        ventInputs: Number(form.ventInputs) || 1,
        ventOutputs: Number(form.ventOutputs) || 1,
        notes: form.notes.trim() || undefined,
      };
      if (space) {
        await updateSpace(space.id, payload);
      } else {
        await createSpace(user.uid, payload);
      }
      onSuccess();
    } catch {
      setError("Erro ao salvar espaço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome do espaço *</Label>
        <Input
          id="name"
          placeholder="Ex: Tenda Principal, Closet #1..."
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Tipo */}
      <div className="space-y-1.5">
        <Label>Tipo de Espaço</Label>
        <div className="grid grid-cols-4 gap-2">
          {SPACE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("type", t.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
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

      {/* Dimensões */}
      <div className="space-y-1.5">
        <Label>Dimensões (cm)</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "widthCm" as const, label: "Largura" },
            { key: "depthCm" as const, label: "Profund." },
            { key: "heightCm" as const, label: "Altura" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <Input
                type="number"
                min="1"
                placeholder="cm"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="bg-background border-border"
              />
            </div>
          ))}
        </div>
        {form.widthCm && form.depthCm && (
          <p className="text-xs text-muted-foreground">
            Área: <span className="text-foreground font-medium">
              {((Number(form.widthCm) * Number(form.depthCm)) / 10000).toFixed(2)} m²
            </span>
          </p>
        )}
      </div>

      {/* Iluminação */}
      <div className="space-y-3">
        <Label>Iluminação</Label>
        <div className="grid grid-cols-3 gap-2">
          {LIGHT_TYPES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => set("lightType", l.value)}
              className={cn(
                "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                form.lightType === l.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {form.lightType !== "natural" && (
            <div className="space-y-1.5">
              <Label htmlFor="watts">Potência (Watts)</Label>
              <Input
                id="watts"
                type="number"
                min="1"
                placeholder="Ex: 480"
                value={form.lightWatts}
                onChange={(e) => set("lightWatts", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Schedule de Luz</Label>
            <div className="flex flex-col gap-1.5">
              {LIGHT_SCHEDULES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("lightSchedule", s.value)}
                  className={cn(
                    "text-left px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    form.lightSchedule === s.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ventilação */}
      <div className="space-y-1.5">
        <Label>Ventilação</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Entradas de ar</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => set("ventInputs", String(Math.max(0, Number(form.ventInputs) - 1)))}
                className="w-8 h-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-all text-sm font-bold">−</button>
              <span className="w-8 text-center font-bold text-lg text-foreground">{form.ventInputs}</span>
              <button type="button" onClick={() => set("ventInputs", String(Number(form.ventInputs) + 1))}
                className="w-8 h-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-all text-sm font-bold">+</button>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Saídas de ar</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => set("ventOutputs", String(Math.max(0, Number(form.ventOutputs) - 1)))}
                className="w-8 h-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-all text-sm font-bold">−</button>
              <span className="w-8 text-center font-bold text-lg text-foreground">{form.ventOutputs}</span>
              <button type="button" onClick={() => set("ventOutputs", String(Number(form.ventOutputs) + 1))}
                className="w-8 h-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-all text-sm font-bold">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Notas sobre este espaço..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="bg-background border-border min-h-[70px] resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Salvando..." : space ? "Salvar Alterações" : "Criar Espaço"}
        </Button>
      </div>
    </form>
  );
}
