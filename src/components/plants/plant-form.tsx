"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createPlant, updatePlant } from "@/lib/plants";
import { useSpaces } from "@/hooks/use-spaces";
import { getSpaceMeta } from "@/lib/space-constants";
import { STAGE_LABELS, STAGE_ORDER, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage, GrowEnv, Medium } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Leaf, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_EMOJI: Record<GrowStage, string> = {
  semente: "🌱",
  muda: "🌿",
  vegetativo: "🍃",
  floracao: "🌸",
  colheita: "✂️",
  secagem: "🍂",
};

const MEDIUM_SHORT: Record<string, string> = {
  terra: "Terra",
  coco: "Coco",
  hidro: "Hidro",
  aeroponia: "Aeroponia",
};

const ENV_EMOJI: Record<string, string> = {
  indoor: "🏠",
  outdoor: "🌤️",
  greenhouse: "🌿",
};

interface PlantFormProps {
  plant?: Plant;
}

function Section({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
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
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{summary}</span>
          )}
          <ChevronDown
            size={15}
            className={cn(
              "text-muted-foreground transition-transform duration-200 shrink-0",
              open && "rotate-180"
            )}
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

export function PlantForm({ plant }: PlantFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { spaces } = useSpaces();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set(["identificacao"]));

  const [form, setForm] = useState({
    name: plant?.name ?? "",
    strain: plant?.strain ?? "",
    stage: (plant?.stage ?? "semente") as GrowStage,
    environment: (plant?.environment ?? "indoor") as GrowEnv,
    medium: (plant?.medium ?? "terra") as Medium,
    germinationDate: plant?.germinationDate ?? new Date().toISOString().split("T")[0],
    potSize: plant?.potSize?.toString() ?? "",
    spaceId: plant?.spaceId ?? "",
    notes: plant?.notes ?? "",
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
        name: form.name.trim(),
        strain: form.strain.trim(),
        stage: form.stage,
        environment: form.environment,
        medium: form.medium,
        germinationDate: form.germinationDate,
        stageChangedAt: plant?.stageChangedAt ?? new Date().toISOString(),
        potSize: form.potSize ? Number(form.potSize) : undefined,
        spaceId: form.spaceId || undefined,
        notes: form.notes.trim() || undefined,
        photoUrl: plant?.photoUrl,
      };
      if (plant) {
        await updatePlant(plant.id, payload);
        router.push(`/plants/${plant.id}`);
      } else {
        const id = await createPlant(user.uid, payload);
        router.push(`/plants/${id}`);
      }
    } catch {
      setError("Erro ao salvar planta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const selectedSpace = spaces.find((s) => s.id === form.spaceId);

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

      {/* Identificação */}
      <Section
        id="identificacao"
        title="Identificação"
        summary={form.name || form.strain ? [form.name, form.strain].filter(Boolean).join(" · ") : undefined}
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
            <Label htmlFor="strain">Strain / Genética *</Label>
            <Input
              id="strain"
              placeholder="Ex: OG Kush, Blue Dream..."
              value={form.strain}
              onChange={(e) => set("strain", e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>
      </Section>

      {/* Fase */}
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

      {/* Cultivo */}
      <Section
        id="cultivo"
        title="Configuração do Cultivo"
        summary={[ENV_LABELS[form.environment], MEDIUM_SHORT[form.medium], form.potSize ? `${form.potSize}L` : ""].filter(Boolean).join(" · ")}
        open={open.has("cultivo")}
        onToggle={toggle}
      >
        {/* Ambiente */}
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

        {/* Substrato */}
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

        {/* Datas e Vaso */}
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

        {/* Espaço */}
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

      {/* Observações */}
      <Section
        id="notas"
        title="Observações"
        summary={form.notes ? form.notes.slice(0, 40) + (form.notes.length > 40 ? "…" : "") : undefined}
        open={open.has("notas")}
        onToggle={toggle}
      >
        <Textarea
          placeholder="Anotações gerais sobre esta planta..."
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-border"
        >
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
