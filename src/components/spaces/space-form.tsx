"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSpace, updateSpace } from "@/lib/spaces";
import {
  SPACE_TYPES, LIGHT_TYPES, LIGHT_SCHEDULES,
  VENT_ROLES, VENT_TYPES, VENT_SIZES,
} from "@/lib/space-constants";
import type { GrowSpace, SpaceType, LightType, VentilationUnit, VentRole, VentType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface SpaceFormProps {
  space?: GrowSpace;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpaceForm({ space, onSuccess, onCancel }: SpaceFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingVent, setAddingVent] = useState(false);

  const [form, setForm] = useState({
    name: space?.name ?? "",
    type: (space?.type ?? "tenda") as SpaceType,
    widthCm: space?.widthCm?.toString() ?? "",
    depthCm: space?.depthCm?.toString() ?? "",
    heightCm: space?.heightCm?.toString() ?? "",
    lightType: (space?.lightType ?? "led") as LightType,
    lightWatts: space?.lightWatts?.toString() ?? "",
    lightSchedule: space?.lightSchedule ?? "18/6",
    notes: space?.notes ?? "",
  });

  const [ventilations, setVentilations] = useState<VentilationUnit[]>(
    space?.ventilations ?? []
  );

  const [newVent, setNewVent] = useState<Omit<VentilationUnit, "id">>({
    role: "saida",
    type: "inline",
    sizeMm: 150,
    label: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addVent() {
    setVentilations((prev) => [...prev, { ...newVent, id: uid() }]);
    setNewVent({ role: "saida", type: "inline", sizeMm: 150, label: "" });
    setAddingVent(false);
  }

  function removeVent(id: string) {
    setVentilations((prev) => prev.filter((v) => v.id !== id));
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
      const ventInputs  = ventilations.filter((v) => v.role === "entrada").length;
      const ventOutputs = ventilations.filter((v) => v.role === "saida").length;
      const payload = {
        name: form.name.trim(),
        type: form.type,
        widthCm: Number(form.widthCm) || 0,
        depthCm: Number(form.depthCm) || 0,
        heightCm: Number(form.heightCm) || 0,
        lightType: form.lightType,
        lightSchedule: form.lightSchedule,
        ventInputs:  ventilations.length ? ventInputs  : 1,
        ventOutputs: ventilations.length ? ventOutputs : 1,
        ventilations,
        ...(form.lightWatts ? { lightWatts: Number(form.lightWatts) } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };
      if (space) {
        await updateSpace(space.id, payload);
      } else {
        await createSpace(user.uid, payload);
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[SpaceForm] save error:", msg);
      setError(`Erro ao salvar espaço: ${msg}`);
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
            <button key={t.value} type="button" onClick={() => set("type", t.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                form.type === t.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}>
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
            { key: "widthCm" as const,  label: "Largura" },
            { key: "depthCm" as const,  label: "Comprimento" },
            { key: "heightCm" as const, label: "Altura" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <Input
                type="number" min="1" placeholder="cm"
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
            {form.heightCm && (
              <> · Volume: <span className="text-foreground font-medium">
                {((Number(form.widthCm) * Number(form.depthCm) * Number(form.heightCm)) / 1_000_000).toFixed(2)} m³
              </span></>
            )}
          </p>
        )}
      </div>

      {/* Iluminação */}
      <div className="space-y-3">
        <Label>Iluminação</Label>
        <div className="grid grid-cols-3 gap-2">
          {LIGHT_TYPES.map((l) => (
            <button key={l.value} type="button" onClick={() => set("lightType", l.value)}
              className={cn(
                "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                form.lightType === l.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {form.lightType !== "natural" && (
            <div className="space-y-1.5">
              <Label htmlFor="watts">Potência (Watts)</Label>
              <Input
                id="watts" type="number" min="1" placeholder="Ex: 480"
                value={form.lightWatts}
                onChange={(e) => set("lightWatts", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          )}
          <div className={cn("space-y-1.5", form.lightType === "natural" && "col-span-2")}>
            <Label>Schedule de Luz</Label>
            <div className="flex flex-col gap-1.5">
              {LIGHT_SCHEDULES.map((s) => (
                <button key={s.value} type="button" onClick={() => set("lightSchedule", s.value)}
                  className={cn(
                    "text-left px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    form.lightSchedule === s.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ventilação */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Ventilação</Label>
          <button
            type="button"
            onClick={() => setAddingVent((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={12} />
            Adicionar
          </button>
        </div>

        {/* Lista de ventilações */}
        {ventilations.length > 0 && (
          <div className="space-y-2">
            {ventilations.map((v) => {
              const roleMeta = VENT_ROLES.find((r) => r.value === v.role)!;
              const typeMeta = VENT_TYPES.find((t) => t.value === v.type)!;
              return (
                <div key={v.id} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-primary w-4">{roleMeta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {roleMeta.label}
                      {v.sizeMm ? ` · ${v.sizeMm}mm` : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {typeMeta.label}{v.label ? ` — ${v.label}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVent(v.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {ventilations.length === 0 && !addingVent && (
          <div className="flex items-center gap-2 text-muted-foreground/50 text-xs py-2">
            <Wind size={13} />
            <span>Nenhuma ventilação cadastrada</span>
          </div>
        )}

        {/* Form inline para nova ventilação */}
        {addingVent && (
          <div className="bg-background border border-primary/20 rounded-xl p-3 space-y-3">
            {/* Role */}
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-medium">Função</p>
              <div className="flex gap-2">
                {VENT_ROLES.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setNewVent((p) => ({ ...p, role: r.value as VentRole }))}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      newVent.role === r.value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}>
                    {r.emoji} {r.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-medium">Tipo de equipamento</p>
              <div className="grid grid-cols-2 gap-1.5">
                {VENT_TYPES.map((t) => (
                  <button key={t.value} type="button"
                    onClick={() => setNewVent((p) => ({ ...p, type: t.value as VentType }))}
                    className={cn(
                      "py-1.5 px-2 rounded-lg border text-xs font-medium transition-all text-left",
                      newVent.type === t.value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            {["inline", "extrator", "axial"].includes(newVent.type) && (
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground font-medium">Diâmetro (mm)</p>
                <div className="flex gap-1.5">
                  {VENT_SIZES.map((s) => (
                    <button key={s} type="button"
                      onClick={() => setNewVent((p) => ({ ...p, sizeMm: s }))}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        newVent.sizeMm === s
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Label */}
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-medium">Nome / marca (opcional)</p>
              <Input
                placeholder="Ex: Systemair RVK 125"
                value={newVent.label ?? ""}
                onChange={(e) => setNewVent((p) => ({ ...p, label: e.target.value }))}
                className="bg-card border-border h-8 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" size="sm" onClick={addVent}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs">
                Adicionar
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setAddingVent(false)}
                className="border-border h-8 text-xs">
                Cancelar
              </Button>
            </div>
          </div>
        )}
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
        <Button type="submit" disabled={loading}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Salvando..." : space ? "Salvar Alterações" : "Criar Espaço"}
        </Button>
      </div>
    </form>
  );
}
