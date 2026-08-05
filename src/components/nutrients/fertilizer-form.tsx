"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createFertilizer, updateFertilizer } from "@/lib/fertilizers";
import type { Fertilizer, FertilizerType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES: { value: FertilizerType; label: string; emoji: string }[] = [
  { value: "organico", label: "Orgânico", emoji: "🌿" },
  { value: "mineral", label: "Mineral", emoji: "⚗️" },
  { value: "organomineral", label: "Organomineral", emoji: "🔬" },
  { value: "knf", label: "KNF", emoji: "🍃" },
  { value: "bioestimulante", label: "Bioestimulante", emoji: "⚡" },
  { value: "pk_boost", label: "PK Boost", emoji: "💥" },
  { value: "cal_mag", label: "Cal-Mag", emoji: "🦴" },
  { value: "radicular", label: "Radicular", emoji: "🌱" },
  { value: "foliar", label: "Foliar", emoji: "🍀" },
];

const STAGE_LABELS: Record<string, string> = {
  muda: "Muda",
  vegetativo: "Vegetativo",
  floracao_inicio: "Floração início",
  floracao_meio: "Floração meio",
  floracao_fim: "Floração fim",
};

interface FertilizerFormProps {
  existing?: Fertilizer;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FertilizerForm({ existing, onSuccess, onCancel }: FertilizerFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    brand: existing?.brand ?? "",
    type: (existing?.type ?? "organico") as FertilizerType,
    npkN: existing?.npkN?.toString() ?? "",
    npkP: existing?.npkP?.toString() ?? "",
    npkK: existing?.npkK?.toString() ?? "",
    secondaryNutrients: existing?.secondaryNutrients ?? "",
    ecPerMl: existing?.ecPerMl?.toString() ?? "",
    applicationFrequency: existing?.applicationFrequency ?? "",
    notes: existing?.notes ?? "",
    doses: {
      muda: existing?.doses?.muda?.toString() ?? "",
      vegetativo: existing?.doses?.vegetativo?.toString() ?? "",
      floracao_inicio: existing?.doses?.floracao_inicio?.toString() ?? "",
      floracao_meio: existing?.doses?.floracao_meio?.toString() ?? "",
      floracao_fim: existing?.doses?.floracao_fim?.toString() ?? "",
    },
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function setDose(stage: string, value: string) {
    setForm((p) => ({ ...p, doses: { ...p.doses, [stage]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Firestore rejects undefined inside nested objects — filter them out
      const dosesRaw = {
        muda: form.doses.muda ? Number(form.doses.muda) : null,
        vegetativo: form.doses.vegetativo ? Number(form.doses.vegetativo) : null,
        floracao_inicio: form.doses.floracao_inicio ? Number(form.doses.floracao_inicio) : null,
        floracao_meio: form.doses.floracao_meio ? Number(form.doses.floracao_meio) : null,
        floracao_fim: form.doses.floracao_fim ? Number(form.doses.floracao_fim) : null,
      };
      const doses = Object.fromEntries(
        Object.entries(dosesRaw).filter(([, v]) => v !== null)
      ) as Record<string, number>;

      const payload = {
        name: form.name.trim(),
        type: form.type,
        doses,
        ...(form.brand.trim() && { brand: form.brand.trim() }),
        ...(form.npkN && { npkN: Number(form.npkN) }),
        ...(form.npkP && { npkP: Number(form.npkP) }),
        ...(form.npkK && { npkK: Number(form.npkK) }),
        ...(form.secondaryNutrients.trim() && { secondaryNutrients: form.secondaryNutrients.trim() }),
        ...(form.ecPerMl && { ecPerMl: Number(form.ecPerMl) }),
        ...(form.applicationFrequency.trim() && { applicationFrequency: form.applicationFrequency.trim() }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
      };
      if (existing) {
        await updateFertilizer(existing.id, payload);
      } else {
        await createFertilizer(user.uid, payload);
      }
      onSuccess();
    } catch {
      setError("Erro ao salvar fertilizante. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome e Marca */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            placeholder="Ex: Biobizz Grow"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="bg-background border-border"
            required
          />
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            placeholder="Ex: Biobizz"
            value={form.brand}
            onChange={(e) => setField("brand", e.target.value)}
            className="bg-background border-border"
          />
        </div>
      </div>

      {/* Tipo */}
      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setField("type", t.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all",
                form.type === t.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* NPK */}
      <div className="space-y-1.5">
        <Label>NPK (% ou concentração)</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["npkN", "npkP", "npkK"] as const).map((key, i) => (
            <div key={key} className="space-y-1">
              <p className="text-[11px] text-muted-foreground text-center">
                {["N (Nitrogênio)", "P (Fósforo)", "K (Potássio)"][i]}
              </p>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="bg-background border-border text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Secundários e EC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="secondary">Nutrientes secundários</Label>
          <Input
            id="secondary"
            placeholder="Ex: Ca, Mg, Fe"
            value={form.secondaryNutrients}
            onChange={(e) => setField("secondaryNutrients", e.target.value)}
            className="bg-background border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ecPerMl">EC por mL/L (mS/cm)</Label>
          <Input
            id="ecPerMl"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 0.15"
            value={form.ecPerMl}
            onChange={(e) => setField("ecPerMl", e.target.value)}
            className="bg-background border-border"
          />
        </div>
      </div>

      {/* Doses por fase */}
      <div className="space-y-2">
        <Label>Dosagem sugerida por fase (mL/L)</Label>
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {Object.entries(STAGE_LABELS).map(([stage, label], i, arr) => (
            <div
              key={stage}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                i < arr.length - 1 && "border-b border-border"
              )}
            >
              <span className="text-xs text-muted-foreground flex-1">{label}</span>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="—"
                value={form.doses[stage as keyof typeof form.doses]}
                onChange={(e) => setDose(stage, e.target.value)}
                className="bg-card border-border w-24 h-8 text-sm text-right"
              />
              <span className="text-xs text-muted-foreground w-8">mL/L</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frequência */}
      <div className="space-y-1.5">
        <Label htmlFor="freq">Frequência de aplicação</Label>
        <Input
          id="freq"
          placeholder="Ex: A cada rega, 1x por semana..."
          value={form.applicationFrequency}
          onChange={(e) => setField("applicationFrequency", e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="fnotes">Observações</Label>
        <Textarea
          id="fnotes"
          placeholder="Informações adicionais sobre o produto..."
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="bg-background border-border min-h-[72px] resize-none"
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
          disabled={loading || !form.name.trim()}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Salvando..." : existing ? "Salvar Alterações" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
