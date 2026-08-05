"use client";

import { useShopping } from "@/hooks/use-shopping";
import { toggleShoppingItem } from "@/lib/shopping";
import Link from "next/link";
import { ShoppingCart, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const URGENCY_COLOR: Record<string, string> = {
  urgent: "bg-destructive",
  soon: "bg-amber-400",
  ok: "bg-primary",
};

const URGENCY_ORDER: Record<string, number> = { urgent: 0, soon: 1, ok: 2 };

export function WidgetShopping() {
  const { items } = useShopping();

  const pending = items
    .filter((i) => i.status === "pending")
    .sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 2) - (URGENCY_ORDER[b.urgency] ?? 2))
    .slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ShoppingCart size={14} className="text-accent" />
          Lista de Compras
          {pending.length > 0 && (
            <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-medium">
              {pending.length}
            </span>
          )}
        </h3>
        <Link href="/shopping" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver tudo →
        </Link>
      </div>

      {pending.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhum item pendente ✓</p>
          <Link href="/shopping" className="text-xs text-primary mt-1 block hover:underline">
            Adicionar →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {pending.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleShoppingItem(item.id, item.status)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 transition-colors text-left group"
            >
              <Circle
                size={15}
                className="shrink-0 text-muted-foreground/30 group-hover:text-primary transition-colors"
              />
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  URGENCY_COLOR[item.urgency] ?? "bg-primary"
                )}
              />
              <span className="flex-1 text-sm text-foreground truncate">{item.name}</span>
              {item.estimatedPrice && (
                <span className="text-[10px] text-muted-foreground/50 shrink-0">
                  R$ {item.estimatedPrice.toFixed(0)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
