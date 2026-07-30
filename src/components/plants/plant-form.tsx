"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createPlant, updatePlant } from "@/lib/plants";
import { STAGE_LABELS, STAGE_ORDER, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage, GrowEnv, Medium } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";

interface PlantFormProps {
  plant?: Plant;
}

export function PlantForm({ plant }: PlantFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: plant?.name ?? "",
    strain: plant?.strain ?? "",
    stage: (plant?.stage ?? "semente") as GrowStage,
    environment: (plant?.environment ?? "indoor") as GrowEnv,
    medium: (plant?.medium ?? "terra") as Medium,
    germinationDate: plant?.germinationDate ?? new Date().toISOString().split("T")[0],
    potSize: plant?.potSize?.toString() ?? "",
    notes: plant?.notes ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim() || !form.strain.trim()) {
      setError("Nome e strain são obrigatórios.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf size={22} className="text-primary" />
          {plant ? "Editar Planta" : "Nova Planta"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {plant ? "Atualize as informações da sua planta." : "Cadastre uma nova planta no seu cultivo."}
        </p>
      </div>

      {/* Identificação */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Fase */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fase Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAGE_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("stage", s)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  form.stage === s
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <StageIcon stage={s} active={form.stage === s} />
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuração do Cultivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ambiente */}
            <div className="space-y-1.5">
              <Label>Ambiente</Label>
              <div className="flex gap-2">
                {(Object.keys(ENV_LABELS) as GrowEnv[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => set("environment", env)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      form.environment === env
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ENV_LABELS[env]}
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
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      form.medium === m
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {MEDIUM_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Anotações gerais sobre esta planta..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="bg-background border-border min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end">
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

function StageIcon({ stage, active }: { stage: GrowStage; active: boolean }) {
  const icons: Record<GrowStage, string> = {
    semente: "🌱",
    muda: "🌿",
    vegetativo: "🍃",
    floracao: "🌸",
    colheita: "✂️",
    secagem: "🍂",
  };
  return <span className={`text-lg ${active ? "" : "opacity-60"}`}>{icons[stage]}</span>;
}
