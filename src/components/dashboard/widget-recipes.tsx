"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";
import type { NutritionRecipe } from "@/lib/recipes";
import type { GrowStage } from "@/lib/types";
import { STAGE_ORDER } from "@/lib/constants";

interface Props {
  recipes: NutritionRecipe[];
}

export function WidgetRecipes({ recipes }: Props) {
  const countByStage: Partial<Record<GrowStage, number>> = {};
  for (const r of recipes) {
    countByStage[r.stage] = (countByStage[r.stage] ?? 0) + 1;
  }

  const stagesWithRecipes = STAGE_ORDER.filter((s) => (countByStage[s] ?? 0) > 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FlaskConical size={14} className="text-primary" />
          Receitas de Nutrição
          {recipes.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-medium">
              {recipes.length}
            </span>
          )}
        </h3>
        <Link href="/tools/recipes" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver receitas →
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma receita cadastrada</p>
          <Link href="/tools/recipes" className="text-xs text-primary mt-1 block hover:underline">
            Criar receita →
          </Link>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          {stagesWithRecipes.map((stage) => (
            <div key={stage} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{STAGE_LABELS[stage]}</span>
              <span className="text-xs font-semibold text-primary">
                {countByStage[stage]} receita{(countByStage[stage] ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
