"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createHarvestLog } from "@/lib/harvest";
import { useAuth } from "@/contexts/auth-context";
import type { Plant, HarvestLog } from "@/lib/types";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  plants: Plant[];
  defaultPlantId?: string;
}

const TRICHOME_OPTIONS: { value: HarvestLog["trichomeStage"]; label: string; color: string }[] = [
  { value: "transparente", label: "Transparente", color: "bg-sky-500/15 border-sky-500/40 text-sky-400" },
  { value: "leitoso", label: "Leitoso", color: "bg-slate-400/15 border-slate-400/40 text-slate-300" },
  { value: "ambar_50", label: "50% Âmbar", color: "bg-amber-500/15 border-amber-500/40 text-amber-400" },
  { value: "ambar_100", label: "100% Âmbar", color: "bg-orange-500/15 border-orange-500/40 text-orange-400" },
];

export function HarvestForm({ open, onClose, onSaved, plants, defaultPlantId }: Props) {
  const { user } = useAuth();

  const [plantId, setPlantId] = useState(defaultPlantId ?? "");
  const [plantName, setPlantName] = useState(() => {
    if (defaultPlantId) {
      const p = plants.find((pl) => pl.id === defaultPlantId);
      return p?.name ?? "";
    }
    return "";
  });
  const [strain, setStrain] = useState(() => {
    if (defaultPlantId) {
      const p = plants.find((pl) => pl.id === defaultPlantId);
      return p?.strain ?? "";
    }
    return "";
  });
  const [harvestDate, setHarvestDate] = useState((() => { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })());
  const [wetWeightG, setWetWeightG] = useState("");
  const [dryWeightG, setDryWeightG] = useState("");
  const [curedWeightG, setCuredWeightG] = useState("");
  const [floweringWeeks, setFloweringWeeks] = useState("");
  const [trichomeStage, setTrichomeStage] = useState<HarvestLog["trichomeStage"] | "">("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handlePlantChange(id: string) {
    setPlantId(id);
    if (id) {
      const p = plants.find((pl) => pl.id === id);
      if (p) {
        setPlantName(p.name);
        setStrain(p.strain);
      }
    } else {
      setPlantName("");
      setStrain("");
    }
  }

  function resetForm() {
    setPlantId(defaultPlantId ?? "");
    const p = defaultPlantId ? plants.find((pl) => pl.id === defaultPlantId) : undefined;
    setPlantName(p?.name ?? "");
    setStrain(p?.strain ?? "");
    setHarvestDate((() => { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })());
    setWetWeightG("");
    setDryWeightG("");
    setCuredWeightG("");
    setFloweringWeeks("");
    setTrichomeStage("");
    setRating(0);
    setNotes("");
    setError(null);
    setSaved(false);
  }

  async function handleSave() {
    if (!user) return;
    if (!plantName.trim() || !strain.trim() || !harvestDate) {
      setError("Nome da planta, strain e data são obrigatórios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createHarvestLog(user.uid, {
        plantId: plantId || undefined,
        plantName: plantName.trim(),
        strain: strain.trim(),
        harvestDate,
        wetWeightG: wetWeightG ? parseFloat(wetWeightG) : undefined,
        dryWeightG: dryWeightG ? parseFloat(dryWeightG) : undefined,
        curedWeightG: curedWeightG ? parseFloat(curedWeightG) : undefined,
        floweringWeeks: floweringWeeks ? parseInt(floweringWeeks) : undefined,
        trichomeStage: (trichomeStage as HarvestLog["trichomeStage"]) || undefined,
        rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined,
      });
      onSaved();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar colheita.");
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
          <SheetTitle className="text-base font-semibold">Registrar Colheita</SheetTitle>
        </SheetHeader>

        {saved ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Colheita registrada!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Os dados foram salvos com sucesso.</p>
              </div>
            </div>
            <Button type="button" onClick={handleClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Plant selection */}
            {plants.length > 0 ? (
              <div className="space-y-1.5">
                <Label htmlFor="hf-plant">Planta</Label>
                <select
                  id="hf-plant"
                  value={plantId}
                  onChange={(e) => handlePlantChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Digitar manualmente...</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.strain}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Plant name + Strain */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hf-name">Nome da planta *</Label>
                <Input
                  id="hf-name"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="Ex: Planta 1"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hf-strain">Strain *</Label>
                <Input
                  id="hf-strain"
                  value={strain}
                  onChange={(e) => setStrain(e.target.value)}
                  placeholder="Ex: White Widow"
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Harvest date */}
            <div className="space-y-1.5">
              <Label htmlFor="hf-date">Data da colheita *</Label>
              <Input
                id="hf-date"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            {/* Weights */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Pesos (gramas)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hf-wet" className="text-xs">Úmido</Label>
                  <Input
                    id="hf-wet"
                    type="number"
                    min="0"
                    step="0.1"
                    value={wetWeightG}
                    onChange={(e) => setWetWeightG(e.target.value)}
                    placeholder="0.0 g"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hf-dry" className="text-xs">Seco</Label>
                  <Input
                    id="hf-dry"
                    type="number"
                    min="0"
                    step="0.1"
                    value={dryWeightG}
                    onChange={(e) => setDryWeightG(e.target.value)}
                    placeholder="0.0 g"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hf-cured" className="text-xs">Curado</Label>
                  <Input
                    id="hf-cured"
                    type="number"
                    min="0"
                    step="0.1"
                    value={curedWeightG}
                    onChange={(e) => setCuredWeightG(e.target.value)}
                    placeholder="0.0 g"
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </div>

            {/* Flowering weeks */}
            <div className="space-y-1.5">
              <Label htmlFor="hf-weeks">Semanas de floração (opcional)</Label>
              <Input
                id="hf-weeks"
                type="number"
                min="1"
                step="1"
                value={floweringWeeks}
                onChange={(e) => setFloweringWeeks(e.target.value)}
                placeholder="Ex: 8"
                className="bg-background border-border"
              />
            </div>

            {/* Trichome stage */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Estágio dos Tricomas</Label>
              <div className="flex flex-wrap gap-2">
                {TRICHOME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrichomeStage(trichomeStage === opt.value ? "" : opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      trichomeStage === opt.value
                        ? opt.color
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Avaliação</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={22}
                      className={cn(
                        "transition-colors",
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="hf-notes">Observações (opcional)</Label>
              <Textarea
                id="hf-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sabor, aroma, efeito, notas do cultivo..."
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
                disabled={saving || !plantName.trim() || !strain.trim() || !harvestDate}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : "Salvar Colheita"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
