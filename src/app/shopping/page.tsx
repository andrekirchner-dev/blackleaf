"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useShopping } from "@/hooks/use-shopping";
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  type ShoppingCategory,
  type ShoppingUrgency,
  type ShoppingItem,
  SHOPPING_CATEGORIES,
  URGENCY_CONFIG,
} from "@/lib/shopping";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShoppingCart, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: { name: string; category: ShoppingCategory; urgency: ShoppingUrgency; estimatedPrice?: number; notes?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("outros");
  const [urgency, setUrgency] = useState<ShoppingUrgency>("soon");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd({
        name: name.trim(),
        category,
        urgency,
        ...(price ? { estimatedPrice: parseFloat(price) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar item.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Novo Item</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoFocus
            placeholder="Nome do item..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border"
          />

          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Categoria</p>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {(Object.entries(SHOPPING_CATEGORIES) as [ShoppingCategory, { label: string; emoji: string }][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-medium border transition-colors",
                    category === key
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  <span className="text-base">{cfg.emoji}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Urgência</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["urgent", "soon", "ok"] as ShoppingUrgency[]).map((u) => {
                const cfg = URGENCY_CONFIG[u];
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition-colors",
                      urgency === u ? cn(cfg.bg, cfg.color) : "border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">Preço estimado (R$)</p>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">Notas</p>
              <Input
                placeholder="Opcional..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" disabled={!name.trim() || saving} className="w-full">
            {saving ? "Salvando..." : "Adicionar Item"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const urgency = URGENCY_CONFIG[item.urgency];
  const category = SHOPPING_CATEGORIES[item.category];
  const purchased = item.status === "purchased";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        purchased ? "bg-muted/10 border-border/50 opacity-60" : "bg-card border-border"
      )}
    >
      <button
        onClick={() => toggleShoppingItem(item.id, item.status)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          purchased ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {purchased && <Check size={10} className="text-primary-foreground" />}
      </button>

      <span className="text-base shrink-0">{category.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", purchased ? "line-through text-muted-foreground" : "text-foreground")}>
          {item.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("text-[10px] font-medium", urgency.color)}>{urgency.label}</span>
          {item.estimatedPrice && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground">
                R$ {item.estimatedPrice.toFixed(2)}
              </span>
            </>
          )}
          {item.notes && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground truncate">{item.notes}</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => deleteShoppingItem(item.id)}
        className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0 p-1"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

export default function ShoppingPage() {
  const { user } = useAuth();
  const { items, loading } = useShopping();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "purchased">("pending");

  const pending = items.filter((i) => i.status === "pending");
  const purchased = items.filter((i) => i.status === "purchased");

  const urgentCount = pending.filter((i) => i.urgency === "urgent").length;

  const filtered = filter === "all" ? items : filter === "pending" ? pending : purchased;

  const totalEstimated = pending.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0);

  async function handleAdd(data: Parameters<typeof addShoppingItem>[1]) {
    if (!user) return;
    await addShoppingItem(user.uid, data).catch((err) => {
      console.error("[Shopping] addItem error:", err);
      throw err;
    });
  }

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <ShoppingCart size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lista de Compras</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {pending.length} {pending.length === 1 ? "item" : "itens"} pendente{pending.length !== 1 ? "s" : ""}
                {urgentCount > 0 && (
                  <span className="text-destructive font-medium"> · {urgentCount} urgente{urgentCount !== 1 ? "s" : ""}</span>
                )}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="shrink-0 gap-1.5">
            <Plus size={15} />
            Adicionar
          </Button>
        </div>
      </MotionItem>

      {totalEstimated > 0 && (
        <MotionItem>
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total estimado (pendentes)</span>
            <span className="text-sm font-bold text-primary">R$ {totalEstimated.toFixed(2)}</span>
          </div>
        </MotionItem>
      )}

      <MotionItem>
        <div className="flex gap-1.5">
          {(["pending", "all", "purchased"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              {f === "pending" ? `Pendentes (${pending.length})` : f === "purchased" ? `Comprados (${purchased.length})` : "Todos"}
            </button>
          ))}
        </div>
      </MotionItem>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <MotionItem>
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🛒</span>
            <p className="text-sm font-medium text-foreground">
              {filter === "pending" ? "Nenhum item pendente" : filter === "purchased" ? "Nenhum item comprado" : "Lista vazia"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "pending" && "Adicione itens que precisa comprar para o cultivo."}
            </p>
          </div>
        </MotionItem>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item) => (
              <ShoppingItemRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddItemModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </MotionPage>
  );
}
