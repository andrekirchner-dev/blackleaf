"use client";

import { useRef, useState } from "react";
import { compressImageToFile } from "@/lib/image-utils";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createEntry, updateEntry } from "@/lib/diary";
import { uploadDiaryPhoto } from "@/lib/storage";
import { DIARY_ENTRY_TYPES } from "@/lib/diary-constants";
import { PRUNING_TYPES } from "@/lib/pruning-constants";
import type {
  Plant,
  DiaryEntry,
  Fertilizer,
  DiaryFertilizerUsage,
  PruningType,
  WaterIrrigationType,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DiaryFormProps {
  plants: Plant[];
  fertilizers?: Fertilizer[];
  defaultPlantId?: string;
  defaultType?: EntryType;
  onSuccess: () => void;
  onCancel: () => void;
  editEntry?: DiaryEntry;
}

type EntryType = DiaryEntry["type"];

const WATER_TYPES = new Set(["rega", "rega_fertilizante", "flush_pre_flip", "flush_pre_colheita"]);
const RUNOFF_TYPES = new Set(["run_off"]);
const FERTILIZER_TYPES = new Set(["nutrientes", "rega_fertilizante"]);

const IRRIGATION_OPTIONS: { value: WaterIrrigationType; label: string; emoji: string }[] = [
  { value: "manual",      label: "Manual",      emoji: "🚿" },
  { value: "gotejamento", label: "Gotejamento",  emoji: "💦" },
  { value: "aspersao",    label: "Aspersão",     emoji: "🌧️" },
  { value: "automatico",  label: "Automático",   emoji: "⚙️" },
];

function getSuggestedWater(plant: Plant): number | null {
  if (!plant.potSize) return null;
  const L = plant.potSize;
  switch (plant.stage) {
    case "semente":
    case "muda":      return Math.round(L * 50);
    case "vegetativo":return Math.round(L * 100);
    case "floracao":
    case "colheita":  return Math.round(L * 135);
    default:          return null;
  }
}

function getStageDoseKey(stage: string): keyof NonNullable<Fertilizer["doses"]> {
  if (stage === "muda")      return "muda";
  if (stage === "vegetativo")return "vegetativo";
  if (stage === "floracao")  return "floracao_inicio";
  if (stage === "colheita")  return "floracao_fim";
  if (stage === "secagem")   return "floracao_fim";
  return "vegetativo";
}

function nowLocal() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function DiaryForm({
  plants,
  fertilizers = [],
  defaultPlantId,
  defaultType,
  onSuccess,
  onCancel,
  editEntry,
}: DiaryFormProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editEntry;

  const initPlantIds = editEntry
    ? [editEntry.plantId]
    : defaultPlantId
    ? [defaultPlantId]
    : plants.length === 1
    ? [plants[0].id]
    : [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(initPlantIds);
  const [type, setType] = useState<EntryType>(editEntry?.type ?? defaultType ?? "rega");
  const [pruningType, setPruningType] = useState<PruningType | "">(editEntry?.pruningType ?? "");
  const [irrigationType, setIrrigationType] = useState<WaterIrrigationType | "">(editEntry?.irrigationType ?? "");
  const [date, setDate] = useState(editEntry?.date ?? nowLocal());
  const [notes, setNotes] = useState(editEntry?.notes ?? "");
  const [ph, setPh] = useState(editEntry?.ph?.toString() ?? "");
  const [ppm, setPpm] = useState(editEntry?.ppm?.toString() ?? "");
  const [phRunoff, setPhRunoff] = useState(editEntry?.phRunoff?.toString() ?? "");
  const [ppmRunoff, setPpmRunoff] = useState(editEntry?.ppmRunoff?.toString() ?? "");
  const [ec, setEc] = useState(editEntry?.ec?.toString() ?? "");
  const [waterAmount, setWaterAmount] = useState(editEntry?.waterAmount?.toString() ?? "");
  const [selectedFertilizers, setSelectedFertilizers] = useState<DiaryFertilizerUsage[]>(editEntry?.fertilizersUsed ?? []);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(editEntry?.photoUrl ?? null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(editEntry?.photoUrl ?? null);

  const showWater = WATER_TYPES.has(type);
  const showRunoff = RUNOFF_TYPES.has(type);
  const showFertilizers = FERTILIZER_TYPES.has(type) && fertilizers.length > 0;
  const showSuggestedWater = showWater && selectedPlantIds.length > 0;

  // First selected plant (for fertilizer dose suggestions)
  const firstPlant = plants.find((p) => p.id === selectedPlantIds[0]);

  function togglePlant(id: string) {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleFertilizer(f: Fertilizer) {
    setSelectedFertilizers((prev) => {
      const exists = prev.find((u) => u.fertilizerId === f.id);
      if (exists) return prev.filter((u) => u.fertilizerId !== f.id);
      const stageKey = firstPlant ? getStageDoseKey(firstPlant.stage) : "vegetativo";
      return [...prev, { fertilizerId: f.id, name: f.name, mlPerLiter: f.doses?.[stageKey] ?? 0 }];
    });
  }

  function updateDose(fertilizerId: string, value: string) {
    setSelectedFertilizers((prev) =>
      prev.map((u) =>
        u.fertilizerId === fertilizerId ? { ...u, mlPerLiter: Number(value) || 0 } : u
      )
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return;
    try {
      const compressed = await compressImageToFile(file, 1280, 0.85);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function removePhoto() {
    setPhotoFile(null);
    if (photoPreview && !existingPhotoUrl) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setExistingPhotoUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError("Sessão expirada. Recarregue a página."); return; }
    if (selectedPlantIds.length === 0) { setError("Selecione ao menos uma planta."); return; }
    setLoading(true);
    setError(null);
    try {
      const entryData = {
        type,
        pruningType: type === "poda" && pruningType ? pruningType : undefined,
        date,
        notes: notes.trim(),
        ph: ph ? Number(ph) : undefined,
        ppm: ppm ? Number(ppm) : undefined,
        phRunoff: phRunoff ? Number(phRunoff) : undefined,
        ppmRunoff: ppmRunoff ? Number(ppmRunoff) : undefined,
        ec: ec ? Number(ec) : undefined,
        waterAmount: waterAmount ? Number(waterAmount) : undefined,
        irrigationType: irrigationType || undefined,
        fertilizersUsed: selectedFertilizers.length > 0 ? selectedFertilizers : undefined,
      };

      if (isEditMode && editEntry) {
        await updateEntry(editEntry.id, entryData);
        if (photoFile) {
          const photoUrl = await uploadDiaryPhoto(user.uid, editEntry.id, photoFile);
          await updateEntry(editEntry.id, { photoUrl });
        } else if (!existingPhotoUrl && editEntry.photoUrl) {
          await updateEntry(editEntry.id, { photoUrl: undefined });
        }
        onSuccess();
        return;
      }

      const entryIds = await Promise.all(
        selectedPlantIds.map((plantId) =>
          createEntry(user.uid, { ...entryData, plantId })
        )
      );

      if (photoFile && entryIds.length > 0) {
        const photoUrl = await uploadDiaryPhoto(user.uid, entryIds[0], photoFile);
        await Promise.all(entryIds.map((id) => updateEntry(id, { photoUrl })));
      }

      onSuccess();
    } catch (err) {
      console.error("[DiaryForm]", err);
      setError("Erro ao salvar registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Plants */}
      <div className="space-y-1.5">
        <Label>Plantas</Label>
        <div className="flex flex-wrap gap-2">
          {plants.map((p) => {
            const selected = selectedPlantIds.includes(p.id);
            const suggested = showSuggestedWater ? getSuggestedWater(p) : null;
            return (
              <div key={p.id} className="flex flex-col items-start gap-0.5">
                <button
                  type="button"
                  onClick={() => togglePlant(p.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    selected
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.name}
                  {selected && suggested != null && (
                    <span className="ml-1.5 text-cyan-400">~{suggested}mL</span>
                  )}
                </button>
                {selected && suggested != null && waterAmount === "" && (
                  <button
                    type="button"
                    onClick={() => setWaterAmount(String(suggested))}
                    className="text-[10px] text-cyan-400 hover:underline ml-1"
                  >
                    Usar sugerido ({suggested} mL)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Type grid */}
      <div className="space-y-1.5">
        <Label>Tipo de Registro</Label>
        <div className="grid grid-cols-3 gap-2">
          {DIARY_ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setType(t.value as EntryType);
                setPruningType("");
                setIrrigationType("");
              }}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all",
                type === t.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pruning sub-type */}
      {type === "poda" && (
        <div className="space-y-1.5">
          <Label>Tipo de Poda</Label>
          <div className="grid grid-cols-3 gap-2">
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

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Data e Hora</Label>
        <Input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Water fields */}
      {showWater && (
        <div className="space-y-3">
          {/* Irrigation type */}
          <div className="space-y-1.5">
            <Label>Tipo de Irrigação</Label>
            <div className="grid grid-cols-4 gap-2">
              {IRRIGATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIrrigationType(irrigationType === opt.value ? "" : opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all",
                    irrigationType === opt.value
                      ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-400"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="waterAmount">Volume (mL)</Label>
              <Input
                id="waterAmount"
                type="number"
                min="0"
                placeholder="Ex: 500"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph">pH entrada</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="Ex: 6.2"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ppm">PPM entrada</Label>
              <Input
                id="ppm"
                type="number"
                min="0"
                placeholder="Ex: 600"
                value={ppm}
                onChange={(e) => setPpm(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phRunoff">pH Run-off</Label>
              <Input
                id="phRunoff"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="Ex: 6.8"
                value={phRunoff}
                onChange={(e) => setPhRunoff(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ppmRunoff">PPM Run-off</Label>
            <Input
              id="ppmRunoff"
              type="number"
              min="0"
              placeholder="Ex: 800"
              value={ppmRunoff}
              onChange={(e) => setPpmRunoff(e.target.value)}
              className="bg-background border-border w-1/2"
            />
          </div>
        </div>
      )}

      {/* Run-off only fields */}
      {showRunoff && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phRunoff">pH Run-off</Label>
              <Input
                id="phRunoff"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="Ex: 6.8"
                value={phRunoff}
                onChange={(e) => setPhRunoff(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ppmRunoff">PPM Run-off</Label>
              <Input
                id="ppmRunoff"
                type="number"
                min="0"
                placeholder="Ex: 800"
                value={ppmRunoff}
                onChange={(e) => setPpmRunoff(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nutrientes-specific: EC */}
      {type === "nutrientes" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ec">EC (mS/cm)</Label>
              <Input
                id="ec"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 1.4"
                value={ec}
                onChange={(e) => setEc(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph-nut">pH entrada</Label>
              <Input
                id="ph-nut"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="Ex: 6.2"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ppm-nut">PPM</Label>
              <Input
                id="ppm-nut"
                type="number"
                min="0"
                placeholder="Ex: 900"
                value={ppm}
                onChange={(e) => setPpm(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fertilizers */}
      {showFertilizers && (
        <div className="space-y-2">
          <Label>Fertilizantes utilizados</Label>
          <div className="space-y-1.5">
            {fertilizers.map((f) => {
              const selected = selectedFertilizers.find((u) => u.fertilizerId === f.id);
              const stageKey = firstPlant ? getStageDoseKey(firstPlant.stage) : "vegetativo";
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
                      {f.brand && <span className="text-xs text-muted-foreground shrink-0">{f.brand}</span>}
                    </div>
                    {suggested != null && !selected && (
                      <span className="text-xs text-muted-foreground shrink-0">{suggested} mL/L</span>
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

      {/* Photo */}
      <div className="space-y-1.5">
        <Label>Foto</Label>
        {photoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-4 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <ImagePlus size={20} />
            <span className="text-xs">Adicionar foto</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder={
            type === "rega" ? "Ex: Planta absorveu bem, folhas firmes..." :
            type === "rega_fertilizante" ? "Ex: Nutrientes da fase de floração..." :
            type === "poda" ? "Ex: Removidas folhas amareladas do baixeiro..." :
            type === "treino" || type === "treinamento" ? "Ex: LST aplicado nos ramos laterais..." :
            type === "run_off" ? "Ex: Run-off coletado após rega..." :
            "Anotações gerais..."
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          disabled={loading || selectedPlantIds.length === 0}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Salvando..." : isEditMode ? "Salvar alterações" : `Salvar${selectedPlantIds.length > 1 ? ` (${selectedPlantIds.length})` : ""}`}
        </Button>
      </div>
    </form>
  );
}
