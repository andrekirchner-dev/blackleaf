"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useShopping } from "@/hooks/use-shopping";
import {
  addShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
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
import { Plus, Trash2, ShoppingCart, Check, X, ExternalLink, Link2, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ItemFormData {
  name: string;
  category: ShoppingCategory;
  urgency: ShoppingUrgency;
  estimatedPrice: string;
  quantity: string;
  link: string;
  notes: string;
}

function ItemModal({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item?: ShoppingItem;
  onClose: () => void;
  onSave: (data: ItemFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState<ItemFormData>({
    name:           item?.name ?? "",
    category:       item?.category ?? "outros",
    urgency:        item?.urgency ?? "soon",
    estimatedPrice: item?.estimatedPrice?.toString() ?? "",
    quantity:       item?.quantity?.toString() ?? "",
    link:           item?.link ?? "",
    notes:          item?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function adjustQty(delta: number) {
    const current = parseInt(form.quantity) || 0;
    const next = Math.max(1, current + delta);
    set("quantity", String(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setDeleting(false);
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
        className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {isEdit ? "Editar Item" : "Novo Item"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">Nome</Label>
            <Input
              autoFocus
              placeholder="Nome do item..."
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">Categoria</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.entries(SHOPPING_CATEGORIES) as [ShoppingCategory, { label: string; emoji: string }][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("category", key)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-medium border transition-colors",
                    form.category === key
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

          {/* Urgency */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">Urgência</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["urgent", "soon", "ok"] as ShoppingUrgency[]).map((u) => {
                const cfg = URGENCY_CONFIG[u];
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => set("urgency", u)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition-colors",
                      form.urgency === u ? cn(cfg.bg, cfg.color) : "border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quantity stepper */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground font-medium">Quantidade</Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors shrink-0"
                >
                  <Minus size={13} />
                </button>
                <Input
                  type="number"
                  min="1"
                  placeholder="—"
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  className="bg-background border-border text-center px-1"
                />
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors shrink-0"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground font-medium">Preço estimado (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.estimatedPrice}
                onChange={(e) => set("estimatedPrice", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Link2 size={11} />
              Link da loja
            </Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground font-medium">Notas</Label>
            <Input
              placeholder="Observações opcionais..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <Button type="submit" disabled={!form.name.trim() || saving} className="flex-1">
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar Item"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ShoppingItemRow({
  item,
  onEdit,
}: {
  item: ShoppingItem;
  onEdit: (item: ShoppingItem) => void;
}) {
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
      {/* Toggle */}
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

      {/* Main info — clickable to edit */}
      <button
        onClick={() => onEdit(item)}
        className="flex-1 min-w-0 text-left"
      >
        <p className={cn("text-sm font-medium truncate", purchased ? "line-through text-muted-foreground" : "text-foreground")}>
          {item.name}
          {item.quantity && item.quantity > 1 && (
            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">
              ×{item.quantity}
            </span>
          )}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("text-[10px] font-medium", urgency.color)}>{urgency.label}</span>
          {item.estimatedPrice != null && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground">
                R$ {item.estimatedPrice.toFixed(2)}
                {item.quantity && item.quantity > 1 && (
                  <span className="text-muted-foreground/60"> × {item.quantity} = R$ {(item.estimatedPrice * item.quantity).toFixed(2)}</span>
                )}
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
      </button>

      {/* External link */}
      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0 p-1"
        >
          <ExternalLink size={13} />
        </a>
      )}
    </motion.div>
  );
}

export default function ShoppingPage() {
  const { user } = useAuth();
  const { items, loading } = useShopping();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "purchased">("pending");

  const pending = items.filter((i) => i.status === "pending");
  const purchased = items.filter((i) => i.status === "purchased");
  const urgentCount = pending.filter((i) => i.urgency === "urgent").length;
  const filtered = filter === "all" ? items : filter === "pending" ? pending : purchased;
  const totalEstimated = pending.reduce((sum, i) => sum + (i.estimatedPrice ?? 0) * (i.quantity ?? 1), 0);

  async function handleAdd(data: ItemFormData) {
    if (!user) return;
    await addShoppingItem(user.uid, {
      name: data.name,
      category: data.category,
      urgency: data.urgency,
      ...(data.estimatedPrice ? { estimatedPrice: parseFloat(data.estimatedPrice) } : {}),
      ...(data.quantity ? { quantity: parseInt(data.quantity) } : {}),
      ...(data.link.trim() ? { link: data.link.trim() } : {}),
      ...(data.notes.trim() ? { notes: data.notes.trim() } : {}),
    });
  }

  async function handleEdit(data: ItemFormData) {
    if (!editItem) return;
    await updateShoppingItem(editItem.id, {
      name: data.name,
      category: data.category,
      urgency: data.urgency,
      estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : undefined,
      quantity: data.quantity ? parseInt(data.quantity) : undefined,
      link: data.link.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
  }

  async function handleDelete() {
    if (!editItem) return;
    await deleteShoppingItem(editItem.id);
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
              <ShoppingItemRow key={item.id} item={item} onEdit={setEditItem} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <ItemModal
            onClose={() => setShowAdd(false)}
            onSave={handleAdd}
          />
        )}
        {editItem && (
          <ItemModal
            key={editItem.id}
            item={editItem}
            onClose={() => setEditItem(null)}
            onSave={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </MotionPage>
  );
}
