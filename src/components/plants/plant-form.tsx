"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createPlant, updatePlant } from "@/lib/plants";
import { createGrowEvent } from "@/lib/events";
import { uploadPlantPhoto } from "@/lib/storage";
import { useSpaces } from "@/hooks/use-spaces";
import { getSpaceMeta } from "@/lib/space-constants";
import { STAGE_LABELS, STAGE_ORDER, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage, GrowEnv, Medium, GeneticType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronDown, Copy, ImagePlus, Leaf, Loader2, Sparkles, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StrainAutocomplete } from "./strain-autocomplete";

const STAGE_EMOJI: Record<GrowStage, string> = {
  semente: "🌱", muda: "🌿", vegetativo: "🍃",
  floracao: "🌸", colheita: "✂️", secagem: "🍂",
};

const MEDIUM_SHORT: Record<string, string> = {
  terra: "Terra", coco: "Coco", hidro: "Hidro", aeroponia: "Aeroponia",
};

const ENV_EMOJI: Record<string, string> = {
  indoor: "🏠", outdoor: "🌤️", greenhouse: "🌿",
};

function deriveGenetics(s: string, i: string, r: string): GeneticType | undefined {
  const sv = Number(s) || 0;
  const iv = Number(i) || 0;
  const rv = Number(r) || 0;
  if (rv > 0) return "autoflowering";
  if (sv + iv === 0) return undefined;
  if (sv >= 65) return "sativa";
  if (iv >= 65) return "indica";
  return "hibrida";
}

const HARVEST_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function Section({
  id, title, summary, open, onToggle, children, sectionRef,
}: {
  id: string; title: string; summary?: string;
  open: boolean; onToggle: (id: string) => void;
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {summary && !open && (
            <span className="text-xs text-muted-foreground truncate max-w-[130px]">{summary}</span>
          )}
          <ChevronDown
            size={15}
            className={cn("text-muted-foreground transition-transform duration-200 shrink-0", open && "rotate-180")}
          />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

type PhotoItem =
  | { type: "saved"; url: string }
  | { type: "pending"; file: File; preview: string };

export function PlantForm({ plant }: { plant?: Plant }) {
  const { user } = useAuth();
  const router = useRouter();
  const { spaces } = useSpaces();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set(["identificacao"]));
  const [autofillMsg, setAutofillMsg] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<"save" | "saveAndAnother">("save");
  const geneticaSectionRef = useRef<HTMLDivElement>(null);

  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    (plant?.photos ?? []).map((url) => ({ type: "saved" as const, url }))
  );
  const [coverSrc, setCoverSrc] = useState<string>(plant?.photoUrl ?? "");

  const [form, setForm] = useState({
    name:                plant?.name ?? "",
    strain:              plant?.strain ?? "",
    bank:                plant?.bank ?? "",
    sativaPercent:       plant?.sativaPercent?.toString() ?? "",
    indicaPercent:       plant?.indicaPercent?.toString() ?? "",
    ruderalisPercent:    plant?.ruderalisPercent?.toString() ?? "",
    geneticsCross:       plant?.geneticsCross ?? "",
    floweringWeeks:      plant?.floweringWeeks?.toString() ?? "",
    germWeeks:           plant?.germWeeks?.toString() ?? "",
    seedlingWeeks:       plant?.seedlingWeeks?.toString() ?? "",
    vegWeeks:            plant?.vegWeeks?.toString() ?? "",
    harvestWeeks:        plant?.harvestWeeks?.toString() ?? "",
    dryingWeeks:         plant?.dryingWeeks?.toString() ?? "",
    thcEstimate:         plant?.thcEstimate ?? "",
    cbdEstimate:         plant?.cbdEstimate ?? "",
    effects:             plant?.effects ?? "",
    terpenes:            plant?.terpenes ?? "",
    yieldIndoor:         plant?.yieldIndoor ?? "",
    yieldOutdoor:        plant?.yieldOutdoor ?? "",
    heightIndoor:        plant?.heightIndoor ?? "",
    heightOutdoor:       plant?.heightOutdoor ?? "",
    harvestMonth:        plant?.harvestMonth ?? "",
    bankRecommendations: plant?.bankRecommendations ?? "",
    stage:               (plant?.stage ?? "semente") as GrowStage,
    environment:         (plant?.environment ?? "indoor") as GrowEnv,
    medium:              (plant?.medium ?? "terra") as Medium,
    germinationDate:     plant?.germinationDate ?? (() => { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })(),
    potSize:             plant?.potSize?.toString() ?? "",
    spaceId:             plant?.spaceId ?? "",
    previousGrowNotes:   plant?.previousGrowNotes ?? "",
    notes:               plant?.notes ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function buildPayload() {
    return {
      name:                form.name.trim(),
      strain:              form.strain.trim(),
      bank:                form.bank.trim() || undefined,
      genetics:            deriveGenetics(form.sativaPercent, form.indicaPercent, form.ruderalisPercent),
      sativaPercent:       form.sativaPercent ? Number(form.sativaPercent) : undefined,
      indicaPercent:       form.indicaPercent ? Number(form.indicaPercent) : undefined,
      ruderalisPercent:    form.ruderalisPercent ? Number(form.ruderalisPercent) : undefined,
      geneticsCross:       form.geneticsCross.trim() || undefined,
      floweringWeeks:      form.floweringWeeks ? Number(form.floweringWeeks) : undefined,
      germWeeks:           form.germWeeks ? Number(form.germWeeks) : undefined,
      seedlingWeeks:       form.seedlingWeeks ? Number(form.seedlingWeeks) : undefined,
      vegWeeks:            form.vegWeeks ? Number(form.vegWeeks) : undefined,
      harvestWeeks:        form.harvestWeeks ? Number(form.harvestWeeks) : undefined,
      dryingWeeks:         form.dryingWeeks ? Number(form.dryingWeeks) : undefined,
      thcEstimate:         form.thcEstimate.trim() || undefined,
      cbdEstimate:         form.cbdEstimate.trim() || undefined,
      effects:             form.effects.trim() || undefined,
      terpenes:            form.terpenes.trim() || undefined,
      yieldIndoor:         form.yieldIndoor.trim() || undefined,
      yieldOutdoor:        form.yieldOutdoor.trim() || undefined,
      heightIndoor:        form.heightIndoor.trim() || undefined,
      heightOutdoor:       form.heightOutdoor.trim() || undefined,
      harvestMonth:        form.harvestMonth || undefined,
      bankRecommendations: form.bankRecommendations.trim() || undefined,
      stage:               form.stage,
      environment:         form.environment,
      medium:              form.medium,
      germinationDate:     form.germinationDate,
      stageChangedAt:      (plant && form.stage !== plant.stage)
        ? new Date().toISOString()
        : (plant?.stageChangedAt ?? new Date().toISOString()),
      potSize:             form.potSize ? Number(form.potSize) : undefined,
      spaceId:             form.spaceId || undefined,
      previousGrowNotes:   form.previousGrowNotes.trim() || undefined,
      notes:               form.notes.trim() || undefined,
    };
  }

  async function handleSave(mode: "save" | "saveAndAnother" = "save") {
    if (!user) return;
    if (!form.name.trim() || !form.strain.trim()) {
      setError("Nome e strain são obrigatórios.");
      setOpen((prev) => new Set([...prev, "identificacao"]));
      return;
    }
    setSaveMode(mode);
    setLoading(true);
    setError(null);
    setStep("Preparando...");

    try {
      const pendingPhotos = photos.filter(
        (p): p is { type: "pending"; file: File; preview: string } => p.type === "pending"
      );
      const savedPhotos = photos.filter(
        (p): p is { type: "saved"; url: string } => p.type === "saved"
      );

      if (plant) {
        // EDIT
        let photoUrls = savedPhotos.map((p) => p.url);
        let newCover = coverSrc;
        let photoWarning = "";

        if (pendingPhotos.length > 0) {
          setStep("Enviando fotos...");
          try {
            const uploaded = await Promise.all(
              pendingPhotos.map((p) => uploadPlantPhoto(user.uid, plant.id, p.file))
            );
            const coverIdx = pendingPhotos.findIndex((p) => p.preview === coverSrc);
            if (coverIdx >= 0) newCover = uploaded[coverIdx];
            photoUrls = [...photoUrls, ...uploaded];
          } catch (photoErr) {
            const msg = photoErr instanceof Error ? photoErr.message : String(photoErr);
            photoWarning = `Fotos não enviadas: ${msg}`;
          }
        }

        setStep("Salvando...");
        await new Promise<void>((resolve, reject) => {
          const tid = setTimeout(
            () => reject(new Error("Tempo limite excedido (10s). Verifique sua conexão.")),
            10000
          );
          updatePlant(plant.id, {
            ...buildPayload(),
            photos: photoUrls.length > 0 ? photoUrls : undefined,
            photoUrl: newCover || (photoUrls.length > 0 ? photoUrls[0] : undefined) || plant.photoUrl || undefined,
          })
            .then(() => { clearTimeout(tid); resolve(); })
            .catch((err) => { clearTimeout(tid); reject(err); });
        });

        if (photoWarning) {
          setError(photoWarning);
          setLoading(false);
          setStep("");
          return;
        }

        // Auto-register stage change event in the grow diary
        if (form.stage !== plant.stage) {
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const stageEventMap: Partial<Record<string, import("@/lib/types").GrowEventType>> = {
            "vegetativo→floracao": "flip",
            "floracao→colheita":   "colheita",
            "colheita→secagem":    "secagem",
            "semente→muda":        "germinacao",
            "muda→vegetativo":     "transplante",
          };
          const transitionKey = `${plant.stage}→${form.stage}`;
          const eventType = stageEventMap[transitionKey];
          if (eventType) {
            await createGrowEvent(user.uid, {
              plantId: plant.id,
              type: eventType,
              date: dateStr,
              notes: `Mudança de fase: ${plant.stage} → ${form.stage}`,
            }).catch(() => { /* non-blocking */ });
          }
        }

        setStep("Redirecionando...");
        router.replace(`/plants/${plant.id}`);
        return;
      }

      // CREATE
      setStep("Criando planta...");
      const plantId = await createPlant(user.uid, buildPayload());

      let photoUrls: string[] = [];
      let newCover = "";
      let photoWarning = "";

      if (pendingPhotos.length > 0) {
        setStep("Enviando fotos...");
        try {
          const uploaded = await Promise.all(
            pendingPhotos.map((p) => uploadPlantPhoto(user.uid, plantId, p.file))
          );
          const coverIdx = pendingPhotos.findIndex((p) => p.preview === coverSrc);
          if (coverIdx >= 0) newCover = uploaded[coverIdx];
          photoUrls = uploaded;
        } catch (photoErr) {
          const msg = photoErr instanceof Error ? photoErr.message : String(photoErr);
          photoWarning = `Fotos não enviadas: ${msg}`;
        }
      }

      if (photoUrls.length > 0) {
        await updatePlant(plantId, {
          photos: photoUrls,
          photoUrl: newCover || photoUrls[0] || undefined,
        });
      }

      if (mode === "saveAndAnother") {
        setForm((prev) => ({
          ...prev,
          name: "",
          potSize: "",
          spaceId: "",
          previousGrowNotes: "",
          notes: "",
          germinationDate: (() => { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })(),
          stage: "semente",
        }));
        setPhotos([]);
        setCoverSrc("");
        setOpen(new Set(["identificacao"]));
        setAutofillMsg(photoWarning ? `Planta cadastrada! (${photoWarning})` : "Planta cadastrada! Preencha os dados da próxima.");
        setTimeout(() => setAutofillMsg(null), 5000);
        setSaveMode("save");
      } else {
        router.push(`/plants/${plantId}`);
      }

      if (photoWarning && mode !== "saveAndAnother") {
        setError(photoWarning);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PlantForm] save error:", msg);
      setError(`Erro ao salvar: ${msg}`);
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  const geneticsSummary = [
    form.sativaPercent ? `${form.sativaPercent}% S` : "",
    form.indicaPercent ? `${form.indicaPercent}% I` : "",
    form.ruderalisPercent ? `${form.ruderalisPercent}% R` : "",
  ].filter(Boolean).join(" / ");

  return (
    <form className="space-y-3 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Leaf size={20} className="text-primary" />
          {plant ? "Editar Planta" : "Nova Planta"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {plant ? "Atualize as informações da sua planta." : "Preencha os dados do seu novo cultivo."}
        </p>
      </div>

      {/* 1 — Identificação */}
      <Section
        id="identificacao"
        title="Identificação"
        summary={[form.name, form.strain, form.bank].filter(Boolean).join(" · ") || undefined}
        open={open.has("identificacao")}
        onToggle={toggle}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da planta *</Label>
            <Input
              id="name"
              placeholder="Ex: Planta 01, Mary Jane..."
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="strain" className="flex items-center gap-1.5">
              Strain / Genética *
              <span className="flex items-center gap-1 text-[10px] text-primary/70 font-normal">
                <Sparkles size={9} />
                autocomplete ativo
              </span>
            </Label>
            <StrainAutocomplete
              value={form.strain}
              onChange={(v) => set("strain", v)}
              onAutoFill={(data) => {
                setForm((prev) => ({
                  ...prev,
                  strain:              data.strain,
                  bank:                data.bank || prev.bank,
                  sativaPercent:       data.sativaPercent || prev.sativaPercent,
                  indicaPercent:       data.indicaPercent || prev.indicaPercent,
                  ruderalisPercent:    data.ruderalisPercent || prev.ruderalisPercent,
                  floweringWeeks:      data.floweringWeeks || prev.floweringWeeks,
                  thcEstimate:         data.thcEstimate || prev.thcEstimate,
                  cbdEstimate:         data.cbdEstimate || prev.cbdEstimate,
                  effects:             data.effects || prev.effects,
                  terpenes:            data.terpenes || prev.terpenes,
                  yieldIndoor:         data.yieldIndoor || prev.yieldIndoor,
                  yieldOutdoor:        data.yieldOutdoor || prev.yieldOutdoor,
                  heightIndoor:        data.heightIndoor || prev.heightIndoor,
                  bankRecommendations: data.bankRecommendations || prev.bankRecommendations,
                }));
                setOpen((prev) => new Set([...prev, "genetica"]));
                const filled = [
                  (data.sativaPercent || data.indicaPercent || data.ruderalisPercent) && "genética",
                  data.floweringWeeks && "floração",
                  data.thcEstimate && "THC",
                  data.effects && "efeitos",
                  data.terpenes && "terpenos",
                ].filter(Boolean);
                setAutofillMsg(filled.length > 0 ? `Preenchido: ${filled.join(", ")}` : "Banco preenchido");
                setTimeout(() => setAutofillMsg(null), 4000);
                setTimeout(() => geneticaSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
              }}
            />
            {autofillMsg && (
              <p className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                <CheckCircle2 size={12} />
                {autofillMsg}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank">Banco / Breeder</Label>
            <Input
              id="bank"
              placeholder="Ex: Royal Queen Seeds, FastBuds, Dinafem..."
              value={form.bank}
              onChange={(e) => set("bank", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>
      </Section>

      {/* 2 — Dados da Strain */}
      <Section
        id="genetica"
        title="Dados da Strain"
        sectionRef={geneticaSectionRef}
        summary={[
          geneticsSummary,
          form.floweringWeeks ? `${form.floweringWeeks} sem.` : "",
          form.thcEstimate ? `THC ${form.thcEstimate}` : "",
        ].filter(Boolean).join(" · ") || undefined}
        open={open.has("genetica")}
        onToggle={toggle}
      >
        {/* Composição genética */}
        <div className="space-y-1.5">
          <Label>Composição Genética (%)</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["sativaPercent", "indicaPercent", "ruderalisPercent"] as const).map((field) => {
              const labels = { sativaPercent: "🌿 Sativa", indicaPercent: "🍃 Indica", ruderalisPercent: "⚡ Ruderalis" };
              return (
                <div key={field} className="space-y-1">
                  <p className="text-[11px] text-muted-foreground font-medium">{labels[field]}</p>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={form[field]}
                      onChange={(e) => set(field, e.target.value)}
                      className="bg-background border-border pr-7 text-center"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cruza / Árvore genealógica */}
        <div className="space-y-1.5">
          <Label htmlFor="geneticsCross">Cruza / Árvore Genealógica</Label>
          <Input
            id="geneticsCross"
            placeholder="Ex: OG Kush x Durban Poison"
            value={form.geneticsCross}
            onChange={(e) => set("geneticsCross", e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Semanas de floração */}
        <div className="space-y-1.5">
          <Label htmlFor="floweringWeeks">Semanas de Floração</Label>
          <Input
            id="floweringWeeks"
            type="number"
            min="4"
            max="20"
            placeholder="Ex: 8"
            value={form.floweringWeeks}
            onChange={(e) => set("floweringWeeks", e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* THC e CBD */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="thc">THC Estimado</Label>
            <Input
              id="thc"
              placeholder="Ex: 18-22%"
              value={form.thcEstimate}
              onChange={(e) => set("thcEstimate", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cbd">CBD Estimado</Label>
            <Input
              id="cbd"
              placeholder="Ex: < 1%"
              value={form.cbdEstimate}
              onChange={(e) => set("cbdEstimate", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Efeitos principais */}
        <div className="space-y-1.5">
          <Label htmlFor="effects">Efeitos Principais</Label>
          <Input
            id="effects"
            placeholder="Ex: Relaxante, Criativo, Eufórico, Sonolento"
            value={form.effects}
            onChange={(e) => set("effects", e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Terpenos / Flavors */}
        <div className="space-y-1.5">
          <Label htmlFor="terpenes">Terpenos / Sabores</Label>
          <Input
            id="terpenes"
            placeholder="Ex: Myrcene, Limonene, Caryophyllene · Cítrico, Terroso"
            value={form.terpenes}
            onChange={(e) => set("terpenes", e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Rendimento */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="yieldIndoor">Rendimento Indoor</Label>
            <Input
              id="yieldIndoor"
              placeholder="Ex: 400-500 g/m²"
              value={form.yieldIndoor}
              onChange={(e) => set("yieldIndoor", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yieldOutdoor">Rendimento Outdoor</Label>
            <Input
              id="yieldOutdoor"
              placeholder="Ex: 600 g/planta"
              value={form.yieldOutdoor}
              onChange={(e) => set("yieldOutdoor", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Altura */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="heightIndoor">Altura Indoor</Label>
            <Input
              id="heightIndoor"
              placeholder="Ex: 80-120 cm"
              value={form.heightIndoor}
              onChange={(e) => set("heightIndoor", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="heightOutdoor">Altura Outdoor</Label>
            <Input
              id="heightOutdoor"
              placeholder="Ex: 150-200 cm"
              value={form.heightOutdoor}
              onChange={(e) => set("heightOutdoor", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Melhor mês de colheita */}
        <div className="space-y-1.5">
          <Label>Melhor Mês de Colheita</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {HARVEST_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("harvestMonth", form.harvestMonth === m ? "" : m)}
                className={cn(
                  "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  form.harvestMonth === m
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Recomendações do banco */}
        <div className="space-y-1.5">
          <Label htmlFor="bankRec">Recomendações do Banco</Label>
          <Textarea
            id="bankRec"
            placeholder="Ex: pH 6.0-6.5, EC máx 2.0, 8 semanas de floração, pode atingir 120cm indoor..."
            value={form.bankRecommendations}
            onChange={(e) => set("bankRecommendations", e.target.value)}
            className="bg-background border-border min-h-[90px] resize-none"
          />
        </div>
      </Section>

      {/* 3 — Fase */}
      <Section
        id="fase"
        title="Fase Atual"
        summary={`${STAGE_EMOJI[form.stage]} ${STAGE_LABELS[form.stage]}`}
        open={open.has("fase")}
        onToggle={toggle}
      >
        <div className="grid grid-cols-2 gap-2">
          {STAGE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("stage", s)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                form.stage === s
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-base">{STAGE_EMOJI[s]}</span>
              <span>{STAGE_LABELS[s]}</span>
            </button>
          ))}
        </div>

        {plant && form.stage !== plant.stage && (
          <div className={cn(
            "flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs",
            STAGE_ORDER.indexOf(form.stage) < STAGE_ORDER.indexOf(plant.stage)
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-primary/10 border-primary/20 text-primary"
          )}>
            <span className="text-sm shrink-0">
              {STAGE_ORDER.indexOf(form.stage) < STAGE_ORDER.indexOf(plant.stage) ? "⚠️" : "✅"}
            </span>
            <span>
              {STAGE_ORDER.indexOf(form.stage) < STAGE_ORDER.indexOf(plant.stage)
                ? `Regressando de ${STAGE_LABELS[plant.stage]} → ${STAGE_LABELS[form.stage]}. O contador de tempo será reiniciado.`
                : `Avançando de ${STAGE_LABELS[plant.stage]} → ${STAGE_LABELS[form.stage]}. O contador de tempo será reiniciado.`
              }
            </span>
          </div>
        )}
      </Section>

      {/* 4 — Cronograma de Fases */}
      <Section
        id="cronograma"
        title="Cronograma de Fases"
        summary={[
          form.seedlingWeeks ? `Muda ${form.seedlingWeeks}s` : "",
          form.vegWeeks ? `Veg ${form.vegWeeks}s` : "",
          form.floweringWeeks ? `Flora ${form.floweringWeeks}s` : "",
        ].filter(Boolean).join(" · ") || "Semanas por fase"}
        open={open.has("cronograma")}
        onToggle={toggle}
      >
        <p className="text-xs text-muted-foreground mb-3">
          Configure a duração planejada de cada fase. Usado para calcular o progresso e o calendário de cultivo.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "germWeeks",     emoji: "🌱", label: "Germinação", key: "germWeeks"     as const, placeholder: "1",  min: 1, max: 4  },
            { id: "seedlingWeeks", emoji: "🌿", label: "Muda",       key: "seedlingWeeks" as const, placeholder: "2",  min: 1, max: 8  },
            { id: "vegWeeks",      emoji: "🍃", label: "Vegetativo", key: "vegWeeks"      as const, placeholder: "8",  min: 1, max: 20 },
            { id: "floweringWks",  emoji: "🌸", label: "Floração",   key: "floweringWeeks" as const, placeholder: "9", min: 4, max: 20 },
            { id: "harvestWeeks",  emoji: "🌾", label: "Colheita",   key: "harvestWeeks"  as const, placeholder: "1",  min: 1, max: 4  },
            { id: "dryingWeeks",   emoji: "🍂", label: "Secagem",    key: "dryingWeeks"   as const, placeholder: "2",  min: 1, max: 8  },
          ].map(({ id, emoji, label, key, placeholder, min, max }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
                <span>{emoji}</span>
                {label}
              </Label>
              <div className="relative">
                <Input
                  id={id}
                  type="number"
                  min={min}
                  max={max}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="bg-background border-border pr-9"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  sem
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5 — Cultivo */}
      <Section
        id="cultivo"
        title="Configuração do Cultivo"
        summary={[ENV_LABELS[form.environment], MEDIUM_SHORT[form.medium], form.potSize ? `${form.potSize}L` : ""].filter(Boolean).join(" · ")}
        open={open.has("cultivo")}
        onToggle={toggle}
      >
        <div className="space-y-1.5">
          <Label>Ambiente</Label>
          <div className="flex gap-2">
            {(Object.keys(ENV_LABELS) as GrowEnv[]).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => set("environment", env)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  form.environment === env
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">{ENV_EMOJI[env]}</span>
                <span>{ENV_LABELS[env]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Substrato</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MEDIUM_LABELS) as Medium[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("medium", m)}
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all",
                  form.medium === m
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {MEDIUM_SHORT[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="germinationDate">Data de Germinação</Label>
            <Input
              id="germinationDate"
              type="date"
              value={form.germinationDate}
              onChange={(e) => set("germinationDate", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="potSize">Tamanho do Vaso (litros)</Label>
            <Input
              id="potSize"
              type="number"
              min="1"
              placeholder="Ex: 15"
              value={form.potSize}
              onChange={(e) => set("potSize", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        {spaces.length > 0 && (
          <div className="space-y-1.5">
            <Label>Espaço de Cultivo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("spaceId", "")}
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-left",
                  !form.spaceId
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Sem espaço
              </button>
              {spaces.map((s) => {
                const meta = getSpaceMeta(s.type);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set("spaceId", s.id)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-1.5",
                      form.spaceId === s.id
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{meta.emoji}</span>
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      {/* 5 — Histórico */}
      <Section
        id="historico"
        title="Histórico de Cultivos Anteriores"
        summary={form.previousGrowNotes ? form.previousGrowNotes.slice(0, 50) + "…" : undefined}
        open={open.has("historico")}
        onToggle={toggle}
      >
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            O que aprendeu em cultivos anteriores com essa strain? Pontos de atenção, ajustes de nutrição, comportamento, etc.
          </p>
          <Textarea
            placeholder="Ex: Muito sensível ao nitrogênio no fim do veg. Precisou de suporte de bambu na semana 4 de floração. pH ideal ficou em 6.2..."
            value={form.previousGrowNotes}
            onChange={(e) => set("previousGrowNotes", e.target.value)}
            className="bg-background border-border min-h-[110px] resize-none"
          />
        </div>
      </Section>

      {/* 6 — Anotações */}
      <Section
        id="notas"
        title="Anotações do Cultivo Atual"
        summary={form.notes ? form.notes.slice(0, 50) + "…" : undefined}
        open={open.has("notas")}
        onToggle={toggle}
      >
        <Textarea
          placeholder="Observações gerais, objetivos, expectativas para este cultivo..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="bg-background border-border min-h-[100px] resize-none"
        />
      </Section>

      {/* 7 — Fotos de Referência */}
      <Section
        id="fotos"
        title="Fotos de Referência"
        open={open.has("fotos")}
        onToggle={toggle}
        summary={
          photos.length > 0
            ? `${photos.length} foto${photos.length > 1 ? "s" : ""}${coverSrc ? " · capa selecionada" : ""}`
            : undefined
        }
      >
        <div className="space-y-3">
          <label className="flex items-center justify-center gap-2 cursor-pointer w-full border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
            <ImagePlus size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Adicionar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const newItems: PhotoItem[] = files.map((f) => ({
                  type: "pending",
                  file: f,
                  preview: URL.createObjectURL(f),
                }));
                setPhotos((prev) => [...prev, ...newItems]);
                e.target.value = "";
              }}
            />
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => {
                const src = photo.type === "saved" ? photo.url : photo.preview;
                const isCover = coverSrc === src;
                return (
                  <div
                    key={i}
                    onClick={() => setCoverSrc(isCover ? "" : src)}
                    className={cn(
                      "group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                      isCover
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {isCover && (
                      <div className="absolute top-1.5 left-1.5 bg-primary rounded-full p-1">
                        <Star size={10} className="text-primary-foreground fill-primary-foreground" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (coverSrc === src) setCoverSrc("");
                        if (photo.type === "pending") URL.revokeObjectURL(photo.preview);
                        setPhotos((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {photos.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {coverSrc
                ? "✓ Foto capa selecionada — clique em outra para trocar"
                : "Clique em uma foto para definir como capa do card"}
            </p>
          )}
        </div>
      </Section>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-border">
          Cancelar
        </Button>
        {!plant && (
          <Button
            type="button"
            disabled={loading}
            variant="outline"
            onClick={() => handleSave("saveAndAnother")}
            className="gap-2 border-border"
          >
            {loading && saveMode === "saveAndAnother" ? (
              <><Loader2 size={15} className="animate-spin" /> {step || "Salvando..."}</>
            ) : (
              <><Copy size={15} /> Salvar e Cadastrar Outra</>
            )}
          </Button>
        )}
        <Button
          type="button"
          disabled={loading}
          onClick={() => handleSave("save")}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
        >
          {loading && saveMode === "save" ? (
            <><Loader2 size={15} className="animate-spin" /> {step || "Salvando..."}</>
          ) : (
            plant ? "Salvar Alterações" : "Cadastrar Planta"
          )}
        </Button>
      </div>
    </form>
  );
}
