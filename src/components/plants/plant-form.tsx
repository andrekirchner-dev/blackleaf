"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createPlant, updatePlant } from "@/lib/plants";
import { useSpaces } from "@/hooks/use-spaces";
import { getSpaceMeta } from "@/lib/space-constants";
import { STAGE_LABELS, STAGE_ORDER, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage, GrowEnv, Medium, GeneticType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Leaf, Loader2, Sparkles } from "lucide-react";
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

const GENETICS: { value: GeneticType; label: string; emoji: string }[] = [
  { value: "sativa",       label: "Sativa",       emoji: "🌿" },
  { value: "indica",       label: "Indica",       emoji: "🍃" },
  { value: "hibrida",      label: "Híbrida",      emoji: "🌱" },
  { value: "autoflowering", label: "Auto",        emoji: "⚡" },
];

function Section({
  id, title, summary, open, onToggle, children,
}: {
  id: string; title: string; summary?: string;
  open: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
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

export function PlantForm({ plant }: { plant?: Plant }) {
  const { user } = useAuth();
  const router = useRouter();
  const { spaces } = useSpaces();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set(["identificacao"]));

  const [form, setForm] = useState({
    name:                plant?.name ?? "",
    strain:              plant?.strain ?? "",
    bank:                plant?.bank ?? "",
    genetics:            (plant?.genetics ?? "") as GeneticType | "",
    floweringWeeks:      plant?.floweringWeeks?.toString() ?? "",
    thcEstimate:         plant?.thcEstimate ?? "",
    cbdEstimate:         plant?.cbdEstimate ?? "",
    yieldIndoor:         plant?.yieldIndoor ?? "",
    yieldOutdoor:        plant?.yieldOutdoor ?? "",
    bankRecommendations: plant?.bankRecommendations ?? "",
    stage:               (plant?.stage ?? "semente") as GrowStage,
    environment:         (plant?.environment ?? "indoor") as GrowEnv,
    medium:              (plant?.medium ?? "terra") as Medium,
    germinationDate:     plant?.germinationDate ?? new Date().toISOString().split("T")[0],
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim() || !form.strain.trim()) {
      setError("Nome e strain são obrigatórios.");
      setOpen((prev) => new Set([...prev, "identificacao"]));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name:                form.name.trim(),
        strain:              form.strain.trim(),
        bank:                form.bank.trim() || undefined,
        genetics:            form.genetics || undefined,
        floweringWeeks:      form.floweringWeeks ? Number(form.floweringWeeks) : undefined,
        thcEstimate:         form.thcEstimate.trim() || undefined,
        cbdEstimate:         form.cbdEstimate.trim() || undefined,
        yieldIndoor:         form.yieldIndoor.trim() || undefined,
        yieldOutdoor:        form.yieldOutdoor.trim() || undefined,
        bankRecommendations: form.bankRecommendations.trim() || undefined,
        stage:               form.stage,
        environment:         form.environment,
        medium:              form.medium,
        germinationDate:     form.germinationDate,
        stageChangedAt:      plant?.stageChangedAt ?? new Date().toISOString(),
        potSize:             form.potSize ? Number(form.potSize) : undefined,
        spaceId:             form.spaceId || undefined,
        previousGrowNotes:   form.previousGrowNotes.trim() || undefined,
        notes:               form.notes.trim() || undefined,
        photoUrl:            plant?.photoUrl,
      };
      if (plant) {
        await updatePlant(plant.id, payload);
        router.push(`/plants/${plant.id}`);
      } else {
        const id = await createPlant(user.uid, payload);
        router.push(`/plants/${id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PlantForm] save error:", msg);
      setError(`Erro ao salvar planta: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const geneticMeta = GENETICS.find((g) => g.value === form.genetics);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl mx-auto">
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
                  strain: data.strain,
                  bank: data.bank || prev.bank,
                  genetics: data.genetics || prev.genetics,
                  floweringWeeks: data.floweringWeeks || prev.floweringWeeks,
                  thcEstimate: data.thcEstimate || prev.thcEstimate,
                  cbdEstimate: data.cbdEstimate || prev.cbdEstimate,
                  yieldIndoor: data.yieldIndoor || prev.yieldIndoor,
                  yieldOutdoor: data.yieldOutdoor || prev.yieldOutdoor,
                  bankRecommendations: data.bankRecommendations || prev.bankRecommendations,
                }));
                setOpen((prev) => new Set([...prev, "genetica"]));
              }}
            />
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

      {/* 2 — Genética */}
      <Section
        id="genetica"
        title="Dados da Strain"
        summary={[
          geneticMeta ? `${geneticMeta.emoji} ${geneticMeta.label}` : "",
          form.floweringWeeks ? `${form.floweringWeeks} sem.` : "",
          form.thcEstimate ? `THC ${form.thcEstimate}` : "",
        ].filter(Boolean).join(" · ") || undefined}
        open={open.has("genetica")}
        onToggle={toggle}
      >
        {/* Tipo genético */}
        <div className="space-y-1.5">
          <Label>Tipo Genético</Label>
          <div className="grid grid-cols-2 gap-2">
            {GENETICS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => set("genetics", form.genetics === g.value ? "" : g.value)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  form.genetics === g.value
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
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

        {/* Yields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="yieldIndoor">Produção Indoor</Label>
            <Input
              id="yieldIndoor"
              placeholder="Ex: 400-500 g/m²"
              value={form.yieldIndoor}
              onChange={(e) => set("yieldIndoor", e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yieldOutdoor">Produção Outdoor</Label>
            <Input
              id="yieldOutdoor"
              placeholder="Ex: 600 g/planta"
              value={form.yieldOutdoor}
              onChange={(e) => set("yieldOutdoor", e.target.value)}
              className="bg-background border-border"
            />
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
      </Section>

      {/* 4 — Cultivo */}
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

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-border">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Salvando...</>
          ) : (
            plant ? "Salvar Alterações" : "Cadastrar Planta"
          )}
        </Button>
      </div>
    </form>
  );
}
