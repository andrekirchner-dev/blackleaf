"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCosts } from "@/hooks/use-costs";
import { useHarvest } from "@/hooks/use-harvest";
import { createCost, deleteCost, COST_CATEGORY_EMOJI, COST_CATEGORY_LABELS } from "@/lib/costs";
import type { CostCategory } from "@/lib/costs";
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
import { Plus, Trash2, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.keys(COST_CATEGORY_LABELS) as CostCategory[];

const CATEGORY_COLORS: Record<CostCategory, string> = {
  energia: "bg-yellow-400",
  nutrientes: "bg-green-400",
  substrato: "bg-amber-600",
  equipamento: "bg-blue-400",
  sementes: "bg-lime-400",
  outro: "bg-zinc-400",
};

const p = (n: number) => String(n).padStart(2, "0");
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function ROIPage() {
  const { user } = useAuth();
  const { costs, loading, refresh } = useCosts();
  const { harvests } = useHarvest();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  const [form, setForm] = useState<{
    category: CostCategory;
    description: string;
    amount: string;
    date: string;
    notes: string;
  }>({
    category: "energia",
    description: "",
    amount: "",
    date: todayStr(),
    notes: "",
  });

  function resetForm() {
    setForm({ category: "energia", description: "", amount: "", date: todayStr(), notes: "" });
  }

  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const totalCuredG = harvests.reduce((s, h) => s + (h.curedWeightG ?? 0), 0);
  const costPerGram = totalCuredG > 0 ? totalCost / totalCuredG : null;

  const salePriceNum = parseFloat(salePrice) || 0;
  const revenue = salePriceNum > 0 && totalCuredG > 0 ? salePriceNum * totalCuredG : null;
  const profit = revenue !== null ? revenue - totalCost : null;
  const margin = revenue !== null && revenue > 0 ? ((profit! / revenue) * 100) : null;

  const byCategory = CATEGORIES.map((cat) => {
    const sum = costs.filter((c) => c.category === cat).reduce((s, c) => s + c.amount, 0);
    return { cat, sum };
  }).filter((x) => x.sum > 0);

  const maxAmount = Math.max(...byCategory.map((x) => x.sum), 1);

  async function handleCreate() {
    if (!user || !form.description.trim() || !form.amount) return;
    setSaving(true);
    try {
      await createCost(user.uid, {
        category: form.category,
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes,
        plantIds: [],
      });
      resetForm();
      setSheetOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteCost(id);
    refresh();
  }

  return (
    <MotionPage>
      <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <DollarSign size={22} className="text-accent" />
                ROI / Custos
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Custo de produção do cultivo</p>
            </div>
            <Button
              onClick={() => setSheetOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={16} />
              Registrar Custo
            </Button>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Total investido</p>
              <p className="text-2xl font-bold text-foreground">R$ {totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Custo por grama</p>
              <p className="text-2xl font-bold text-accent">
                {costPerGram !== null ? `R$ ${costPerGram.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Total colhido (cured)</p>
              <p className="text-2xl font-bold text-primary">{totalCuredG.toFixed(0)}g</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Registros de custo</p>
              <p className="text-2xl font-bold text-foreground">{costs.length}</p>
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              <h2 className="text-sm font-semibold">Simulação de ROI</h2>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale-price">Valor de venda estimado (R$/g)</Label>
              <Input
                id="sale-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 25.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
            {revenue !== null && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receita estimada</span>
                  <span className="font-semibold text-foreground">R$ {revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lucro</span>
                  <span className={cn("font-semibold", profit! >= 0 ? "text-primary" : "text-destructive")}>
                    R$ {profit!.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margem</span>
                  <span className={cn("font-semibold", (margin ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                    {margin!.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </MotionItem>

        {byCategory.length > 0 && (
          <MotionItem>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h2 className="text-sm font-semibold">Por categoria</h2>
              {byCategory.map(({ cat, sum }) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">
                      {COST_CATEGORY_EMOJI[cat]} {COST_CATEGORY_LABELS[cat]}
                    </span>
                    <span className="text-muted-foreground">R$ {sum.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", CATEGORY_COLORS[cat])}
                      style={{ width: `${(sum / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </MotionItem>
        )}

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Histórico de custos</h2>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : costs.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhum custo registrado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {costs.map((cost) => (
                  <div key={cost.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg shrink-0">{COST_CATEGORY_EMOJI[cost.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cost.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {COST_CATEGORY_LABELS[cost.category]} · {cost.date}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      R$ {cost.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(cost.id)}
                      className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MotionItem>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Registrar Custo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.category === cat
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {COST_CATEGORY_EMOJI[cat]} {COST_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-desc">Descrição</Label>
              <Input
                id="cost-desc"
                placeholder="Ex: Conta de luz de julho"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-amount">Valor (R$)</Label>
              <Input
                id="cost-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-date">Data</Label>
              <Input
                id="cost-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-notes">Notas (opcional)</Label>
              <Textarea
                id="cost-notes"
                placeholder="Observações..."
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={!form.description.trim() || !form.amount || saving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Salvando..." : "Registrar Custo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MotionPage>
  );
}
