"use client";

import Link from "next/link";
import { DollarSign } from "lucide-react";
import type { GrowCost } from "@/lib/costs";

interface Props {
  costs: GrowCost[];
  harvestTotalG: number;
}

export function WidgetROI({ costs, harvestTotalG }: Props) {
  const total = costs.reduce((sum, c) => sum + c.amount, 0);
  const costPerGram = harvestTotalG > 0 ? total / harvestTotalG : null;
  const hasData = total > 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign size={14} className="text-accent" />
          Custo de Produção
        </h3>
        <Link href="/tools/roi" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver detalhes →
        </Link>
      </div>

      {!hasData ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhum custo registrado</p>
          <Link href="/tools/roi" className="text-xs text-primary mt-1 block hover:underline">
            Registrar custo →
          </Link>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total investido</span>
            <span className="text-sm font-bold text-foreground">
              R$ {total.toFixed(2)}
            </span>
          </div>
          {costPerGram !== null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Custo/grama</span>
              <span className="text-sm font-semibold text-accent">
                R$ {costPerGram.toFixed(2)}/g
              </span>
            </div>
          )}
          {harvestTotalG > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total colhido</span>
              <span className="text-sm font-medium text-primary">{harvestTotalG.toFixed(0)}g</span>
            </div>
          )}
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent"
              style={{ width: costPerGram !== null ? `${Math.min(100, (costPerGram / 50) * 100)}%` : "0%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
