"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRecipes } from "@/hooks/use-recipes";
import { usePlants } from "@/hooks/use-plants";
import { createRecipe, deleteRecipe } from "@/lib/recipes";
import type { NutritionRecipe, RecipeIngredient } from "@/lib/recipes";
import type { GrowStage, Medium } from "@/lib/types";
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from "@/lib/constants";
import { MEDIUM_LABELS } from "@/lib/constants";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Trash2, FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDIUMS: Medium[] = ["terra", "coco", "hidro", "aeroponia"];

export default function RecipesPage() {
  const { user } = useAuth();
  const { recipes, loading, refresh } = useRecipes();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    medium: Medium;
    stage: GrowStage;
    phMin: string;
    phMax: string;
    ecMin: string;
    ecMax: string;
    waterAmount: string;
    notes: string;
    ingredients: RecipeIngredient[];
  }>({
    name: "",
    description: "",
    medium: "terra",
    stage: "vegetativo",
    phMin: "5.8",
    phMax: "6.5",
    ecMin: "1.0",
    ecMax: "1.8",
    waterAmount: "",
    notes: "",
    ingredients: [{ name: "", amount: "", unit: "mL/L" }],
  });

  function resetForm() {
    setForm({
      name: "",
      description: "",
      medium: "terra",
      stage: "vegetativo",
      phMin: "5.8",
      phMax: "6.5",
      ecMin: "1.0",
      ecMax: "1.8",
      waterAmount: "",
      notes: "",
      ingredients: [{ name: "", amount: "", unit: "mL/L" }],
    });
  }

  function addIngredient() {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", amount: "", unit: "mL/L" }] }));
  }

  function removeIngredient(idx: number) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  }

  function updateIngredient(idx: number, field: keyof RecipeIngredient, value: string) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing),
    }));
  }

  async function handleCreate() {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    try {
      await createRecipe(user.uid, {
        name: form.name.trim(),
        description: form.description,
        medium: form.medium,
        stage: form.stage,
        ph: { min: parseFloat(form.phMin), max: parseFloat(form.phMax) },
        ec: { min: parseFloat(form.ecMin), max: parseFloat(form.ecMax) },
        waterAmount: form.waterAmount ? parseInt(form.waterAmount) : undefined,
        ingredients: form.ingredients.filter((i) => i.name.trim()),
        notes: form.notes,
      });
      resetForm();
      setSheetOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    refresh();
  }

  const byStage = STAGE_ORDER.reduce<Record<GrowStage, NutritionRecipe[]>>((acc, s) => {
    acc[s] = recipes.filter((r) => r.stage === s);
    return acc;
  }, {} as Record<GrowStage, NutritionRecipe[]>);

  return (
    <MotionPage>
      <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FlaskConical size={22} className="text-primary" />
                Receitas de Nutrição
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Fórmulas por fase de cultivo</p>
            </div>
            <Button
              onClick={() => setSheetOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={16} />
              Nova Receita
            </Button>
          </div>
        </MotionItem>

        <MotionItem>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FlaskConical size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium">Nenhuma receita cadastrada</p>
              <p className="text-xs mt-1">Crie receitas de nutrição para cada fase do cultivo</p>
              <button
                onClick={() => setSheetOpen(true)}
                className="text-xs text-primary mt-3 hover:underline"
              >
                Criar primeira receita →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {STAGE_ORDER.filter((s) => byStage[s].length > 0).map((stage) => (
                <div key={stage}>
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground/60 mb-2">
                    {STAGE_LABELS[stage]}
                  </p>
                  <div className="space-y-2">
                    {byStage[stage].map((recipe) => {
                      const expanded = expandedId === recipe.id;
                      return (
                        <div key={recipe.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setExpandedId(expanded ? null : recipe.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/10 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">{recipe.name}</span>
                                <span className={cn(
                                  "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                                  STAGE_COLORS[recipe.stage]
                                )}>
                                  {STAGE_LABELS[recipe.stage]}
                                </span>
                                <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                                  {MEDIUM_LABELS[recipe.medium]}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                <span>pH {recipe.ph.min}–{recipe.ph.max}</span>
                                <span>EC {recipe.ec.min}–{recipe.ec.max} mS/cm</span>
                              </div>
                            </div>
                            {expanded ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
                          </button>

                          {expanded && (
                            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                              {recipe.description && (
                                <p className="text-xs text-muted-foreground">{recipe.description}</p>
                              )}
                              {recipe.waterAmount && (
                                <p className="text-xs text-muted-foreground">
                                  💧 Volume por planta: {recipe.waterAmount} mL
                                </p>
                              )}
                              {recipe.ingredients.length > 0 && (
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground/60 mb-1.5">
                                    Ingredientes
                                  </p>
                                  <div className="space-y-1">
                                    {recipe.ingredients.map((ing, i) => (
                                      <div key={i} className="flex justify-between text-xs">
                                        <span className="text-foreground">{ing.name}</span>
                                        <span className="text-muted-foreground">{ing.amount} {ing.unit}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {recipe.notes && (
                                <p className="text-xs text-muted-foreground border-t border-border/40 pt-2">
                                  📝 {recipe.notes}
                                </p>
                              )}
                              <button
                                onClick={() => handleDelete(recipe.id)}
                                className="flex items-center gap-1.5 text-xs text-destructive/70 hover:text-destructive transition-colors"
                              >
                                <Trash2 size={12} />
                                Excluir receita
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </MotionItem>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[95vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Nova Receita de Nutrição</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            <div className="space-y-1.5">
              <Label htmlFor="recipe-name">Nome da receita</Label>
              <Input
                id="recipe-name"
                placeholder="Ex: Vegetativo Semana 3"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recipe-desc">Descrição (opcional)</Label>
              <Input
                id="recipe-desc"
                placeholder="Breve descrição"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fase</Label>
              <div className="flex gap-2 flex-wrap">
                {STAGE_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, stage: s }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.stage === s
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {STAGE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Meio</Label>
              <div className="flex gap-2 flex-wrap">
                {MEDIUMS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setForm((f) => ({ ...f, medium: m }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.medium === m
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {MEDIUM_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ph-min">pH mínimo</Label>
                <Input
                  id="ph-min"
                  type="number"
                  step="0.1"
                  value={form.phMin}
                  onChange={(e) => setForm((f) => ({ ...f, phMin: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ph-max">pH máximo</Label>
                <Input
                  id="ph-max"
                  type="number"
                  step="0.1"
                  value={form.phMax}
                  onChange={(e) => setForm((f) => ({ ...f, phMax: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ec-min">EC mín (mS/cm)</Label>
                <Input
                  id="ec-min"
                  type="number"
                  step="0.1"
                  value={form.ecMin}
                  onChange={(e) => setForm((f) => ({ ...f, ecMin: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ec-max">EC máx (mS/cm)</Label>
                <Input
                  id="ec-max"
                  type="number"
                  step="0.1"
                  value={form.ecMax}
                  onChange={(e) => setForm((f) => ({ ...f, ecMax: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="water-amount">Volume por planta (mL, opcional)</Label>
              <Input
                id="water-amount"
                type="number"
                placeholder="Ex: 500"
                value={form.waterAmount}
                onChange={(e) => setForm((f) => ({ ...f, waterAmount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingredientes</Label>
                <button
                  onClick={addIngredient}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={12} />
                  Adicionar
                </button>
              </div>
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome (ex: Terra Flower)"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qtd"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                    className="w-16"
                  />
                  <Input
                    placeholder="Un"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                    className="w-20"
                  />
                  {form.ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(idx)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recipe-notes">Notas (opcional)</Label>
              <Textarea
                id="recipe-notes"
                placeholder="Observações, dicas..."
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || saving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Salvando..." : "Criar Receita"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MotionPage>
  );
}
