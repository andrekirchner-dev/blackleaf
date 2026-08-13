"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSeeds } from "@/hooks/use-seeds";
import {
  addSeed,
  updateSeed,
  deleteSeed,
  germinateSeed,
  type SeedEntry,
  type StorageMethod,
  type CreateSeedData,
  STORAGE_METHODS,
  GENETICS_LABELS,
  getStorageHealth,
} from "@/lib/seeds";
import type { GeneticType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Sprout, X, ChevronDown, AlertTriangle, Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HEALTH_STYLE = {
  good: { bar: "bg-primary", text: "text-primary", bg: "bg-primary/10 border-primary/20" },
  warning: { bar: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  danger: { bar: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

function AddSeedModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: CreateSeedData) => Promise<void>;
}) {
  const [strainName, setStrainName] = useState("");
  const [bank, setBank] = useState("");
  const [genetics, setGenetics] = useState<GeneticType | "">("");
  const [feminized, setFeminized] = useState(true);
  const [quantity, setQuantity] = useState("1");
  const [storageMethod, setStorageMethod] = useState<StorageMethod>("fridge");
  const [storageDate, setStorageDate] = useState(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!strainName.trim() || !quantity) return;
    setSaving(true);
    await onAdd({
      strainName: strainName.trim(),
      bank: bank.trim(),
      genetics,
      feminized,
      quantity: parseInt(quantity, 10),
      storageMethod,
      storageDate: new Date(storageDate + "T12:00:00"),
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  const geneticsOptions: { value: GeneticType | ""; label: string; emoji: string }[] = [
    { value: "", label: "Desconhecida", emoji: "❓" },
    { value: "hibrida", label: "Híbrida", emoji: "🌱" },
    { value: "indica", label: "Indica", emoji: "🍃" },
    { value: "sativa", label: "Sativa", emoji: "🌿" },
    { value: "autoflowering", label: "Autoflower", emoji: "⚡" },
  ];

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
          <h2 className="text-base font-bold text-foreground">Nova Semente</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">Nome da Strain *</p>
            <Input
              autoFocus
              placeholder="Ex: OG Kush, Blue Dream..."
              value={strainName}
              onChange={(e) => setStrainName(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">Banco / Breeder</p>
            <Input
              placeholder="Ex: Royal Queen Seeds, Barneys Farm..."
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">Genética</p>
              <div className="relative">
                <select
                  value={genetics}
                  onChange={(e) => setGenetics(e.target.value as GeneticType | "")}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {geneticsOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">Quantidade</p>
              <Input
                type="number"
                min="1"
                max="999"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Tipo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "♀ Feminizada" },
                { value: false, label: "Regular" },
              ].map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => setFeminized(o.value)}
                  className={cn(
                    "py-2 rounded-xl text-xs font-medium border transition-colors",
                    feminized === o.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Método de Armazenamento</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(STORAGE_METHODS) as [StorageMethod, typeof STORAGE_METHODS[StorageMethod]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStorageMethod(key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors text-left",
                    storageMethod === key
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  <span className="text-sm">{cfg.emoji}</span>
                  <span className="truncate">{cfg.label}</span>
                </button>
              ))}
            </div>
            {storageMethod && (
              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                {STORAGE_METHODS[storageMethod].description} · Até {STORAGE_METHODS[storageMethod].maxYears} anos
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">Data de Armazenamento</p>
            <Input
              type="date"
              value={storageDate}
              onChange={(e) => setStorageDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">Notas</p>
            <Input
              placeholder="Origem, lote, observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <Button type="submit" disabled={!strainName.trim() || saving} className="w-full">
            {saving ? "Salvando..." : "Adicionar ao Banco"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function GerminateModal({ seed, onClose }: { seed: SeedEntry; onClose: () => void }) {
  const [count, setCount] = useState(1);
  const [saving, setSaving] = useState(false);

  async function handle() {
    setSaving(true);
    await germinateSeed(seed.id, seed.germinated, seed.quantity, count);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative w-full max-w-xs bg-card border border-border rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Registrar Germinação</h2>
          <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{seed.strainName}</p>
          <p className="text-[11px] text-muted-foreground">{seed.quantity} semente{seed.quantity !== 1 ? "s" : ""} disponíve{seed.quantity !== 1 ? "is" : "l"}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Quantidade germinada</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-9 h-9 rounded-xl border border-border text-foreground hover:bg-muted/30 transition-colors text-lg font-bold"
            >−</button>
            <span className="flex-1 text-center text-xl font-bold text-foreground">{count}</span>
            <button
              onClick={() => setCount((c) => Math.min(seed.quantity, c + 1))}
              className="w-9 h-9 rounded-xl border border-border text-foreground hover:bg-muted/30 transition-colors text-lg font-bold"
            >+</button>
          </div>
        </div>
        <Button onClick={handle} disabled={saving || count > seed.quantity} className="w-full gap-2">
          <Sprout size={14} />
          {saving ? "Registrando..." : `Registrar ${count} germinação${count !== 1 ? "s" : ""}`}
        </Button>
      </motion.div>
    </div>
  );
}

function SeedCard({ seed }: { seed: SeedEntry }) {
  const [showGerminate, setShowGerminate] = useState(false);
  const health = getStorageHealth(seed.storageDate, seed.storageMethod);
  const hs = HEALTH_STYLE[health.status];
  const storage = STORAGE_METHODS[seed.storageMethod];
  const gen = GENETICS_LABELS[seed.genetics || ""];
  const maxYears = storage.maxYears;
  const pct = Math.min(1, health.years / maxYears);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className="bg-card border border-border rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">{seed.strainName}</p>
              {seed.feminized && <span className="text-[11px] text-pink-400 font-medium shrink-0">♀</span>}
            </div>
            {seed.bank && <p className="text-[11px] text-muted-foreground truncate">{seed.bank}</p>}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs">{gen.emoji}</span>
              <span className="text-[11px] text-muted-foreground">{gen.label}</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm">{storage.emoji}</span>
              <span className="text-[11px] text-muted-foreground">{storage.label}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-foreground leading-none">{seed.quantity}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {seed.germinated > 0 && `${seed.germinated} germ.`}
            </p>
          </div>
        </div>

        {/* Storage health bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Tempo de Armazenamento</span>
            <span className={cn("text-[10px] font-medium", hs.text)}>
              {health.status === "danger" && <AlertTriangle size={9} className="inline mr-0.5" />}
              {health.label}
            </span>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full", hs.bar)}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Vida útil estimada: até {maxYears} ano{maxYears !== 1 ? "s" : ""} ({storage.label.toLowerCase()})
          </p>
        </div>

        {seed.notes && (
          <p className="text-[11px] text-muted-foreground/80 italic border-t border-border pt-2">{seed.notes}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGerminate(true)}
            disabled={seed.quantity === 0}
            className="flex-1 gap-1.5 text-xs"
          >
            <Sprout size={13} />
            Germinar
          </Button>
          <button
            onClick={() => deleteSeed(seed.id)}
            className="text-muted-foreground/40 hover:text-destructive transition-colors p-2"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGerminate && (
          <GerminateModal seed={seed} onClose={() => setShowGerminate(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function SeedsPage() {
  const { user } = useAuth();
  const { seeds, loading } = useSeeds();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "autoflowering">("all");

  const filtered = seeds.filter((s) => {
    if (filter === "available") return s.quantity > 0;
    if (filter === "autoflowering") return s.genetics === "autoflowering";
    return true;
  });

  const totalSeeds = seeds.reduce((sum, s) => sum + s.quantity, 0);
  const warningCount = seeds.filter((s) => {
    const h = getStorageHealth(s.storageDate, s.storageMethod);
    return h.status !== "good";
  }).length;

  async function handleAdd(data: CreateSeedData) {
    if (!user) return;
    await addSeed(user.uid, data);
  }

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Beaker size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Banco de Sementes</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalSeeds} semente{totalSeeds !== 1 ? "s" : ""} em estoque
                {warningCount > 0 && (
                  <span className="text-amber-400 font-medium"> · {warningCount} com atenção</span>
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

      {warningCount > 0 && (
        <MotionItem>
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{warningCount} lote{warningCount !== 1 ? "s" : ""} precisam de atenção</strong> — próximos ou além do limite de armazenamento recomendado para o método utilizado.
            </p>
          </div>
        </MotionItem>
      )}

      <MotionItem>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: "all" as const, label: `Todas (${seeds.length})` },
            { key: "available" as const, label: "Disponíveis" },
            { key: "autoflowering" as const, label: "⚡ Autos" },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              {f.label}
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
            <span className="text-4xl block mb-3">🌱</span>
            <p className="text-sm font-medium text-foreground">
              {seeds.length === 0 ? "Banco vazio" : "Nenhuma semente neste filtro"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {seeds.length === 0 && "Adicione suas sementes para controlar o estoque e o tempo de armazenamento."}
            </p>
          </div>
        </MotionItem>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((seed) => (
              <SeedCard key={seed.id} seed={seed} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddSeedModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </MotionPage>
  );
}
