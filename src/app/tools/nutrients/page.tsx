"use client";

import { useState } from "react";
import { NUTRIENTS, type Nutrient } from "@/lib/tools-data/nutrients";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info, AlertTriangle, CheckCircle2, Leaf, Microscope } from "lucide-react";
import { PhotoDiagnose } from "@/components/tools/photo-diagnose";

const MOBILITY_CONFIG = {
  mobile: { label: "Móvel", color: "text-primary", bg: "bg-primary/10 border-primary/20", description: "Sintomas nas folhas VELHAS primeiro" },
  immobile: { label: "Imóvel", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", description: "Sintomas nas folhas NOVAS primeiro" },
  "semi-mobile": { label: "Semi-Móvel", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", description: "Pode afetar novo e velho crescimento" },
} as const;

const CLASS_CONFIG = {
  macro: { label: "Macronutriente", color: "text-foreground", bg: "bg-muted/40" },
  micro: { label: "Micronutriente", color: "text-muted-foreground", bg: "bg-muted/20" },
} as const;

type FilterType = "all" | "macro" | "micro" | "mobile" | "immobile";

function NutrientCard({ nutrient }: { nutrient: Nutrient }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"deficiency" | "excess">("deficiency");
  const mobility = MOBILITY_CONFIG[nutrient.mobility];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-primary">{nutrient.symbol}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{nutrient.name}</span>
              {nutrient.rare && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border">Raro</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", mobility.bg, mobility.color)}>
                {mobility.label}
              </span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded", CLASS_CONFIG[nutrient.class].bg, CLASS_CONFIG[nutrient.class].color)}>
                {CLASS_CONFIG[nutrient.class].label}
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* Function */}
              <div className="px-4 py-3 bg-muted/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{nutrient.function}</p>
              </div>

              {/* Mobility tip */}
              <div className={cn("mx-4 mt-3 px-3 py-2 rounded-xl border flex items-start gap-2", mobility.bg)}>
                <Info size={12} className={cn("shrink-0 mt-0.5", mobility.color)} />
                <p className={cn("text-[11px] font-medium", mobility.color)}>{mobility.description}</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-3">
                <button
                  onClick={() => setTab("deficiency")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    tab === "deficiency" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  Deficiência
                </button>
                <button
                  onClick={() => setTab("excess")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    tab === "excess" ? "bg-amber-400/15 text-amber-400" : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  Excesso
                </button>
              </div>

              <AnimatePresence mode="wait">
                {tab === "deficiency" ? (
                  <motion.div
                    key="deficiency"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Sintomas Visuais</p>
                      <ul className="space-y-1">
                        {nutrient.deficiency.visual.map((v, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <span className="text-destructive mt-0.5 shrink-0">•</span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Progressão</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{nutrient.deficiency.progression}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Causas Comuns</p>
                      <ul className="space-y-1">
                        {nutrient.deficiency.causes.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Como Corrigir</p>
                      <ul className="space-y-1">
                        {nutrient.deficiency.fixes.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <CheckCircle2 size={10} className="text-primary mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 px-2 py-1.5 bg-muted/30 rounded-lg text-center">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">pH Solo</p>
                        <p className="text-xs font-bold text-foreground">{nutrient.phSoil}</p>
                      </div>
                      <div className="flex-1 px-2 py-1.5 bg-muted/30 rounded-lg text-center">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">pH Hidro</p>
                        <p className="text-xs font-bold text-foreground">{nutrient.phHydro}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="excess"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Sintomas de Excesso</p>
                      <ul className="space-y-1">
                        {nutrient.excess.visual.map((v, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Como Corrigir</p>
                      <ul className="space-y-1">
                        {nutrient.excess.fixes.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <CheckCircle2 size={10} className="text-primary mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function NutrientsToolPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = NUTRIENTS.filter((n) => {
    if (filter === "macro") return n.class === "macro";
    if (filter === "micro") return n.class === "micro";
    if (filter === "mobile") return n.mobility === "mobile";
    if (filter === "immobile") return n.mobility === "immobile";
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "macro", label: "Macros" },
    { key: "micro", label: "Micros" },
    { key: "mobile", label: "Folhas velhas" },
    { key: "immobile", label: "Folhas novas" },
  ];

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Microscope size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Diagnóstico Nutricional</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Identifique deficiências e excessos de nutrientes pelo aspecto visual das plantas.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <PhotoDiagnose
          category="nutrients"
          title="Diagnóstico por Foto"
          hint="Envie uma foto das folhas para identificar deficiências ou toxicidades via IA"
        />
      </MotionItem>

      {/* Mobility guide */}
      <MotionItem>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf size={12} className="text-primary" />
              <span className="text-[11px] font-semibold text-primary">Nutrientes Móveis</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">N, P, K, Mg, Mo — a planta redistribui do velho para o novo. Sintomas aparecem nas <strong className="text-foreground">folhas velhas (baixeiras)</strong> primeiro.</p>
          </div>
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf size={12} className="text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400">Nutrientes Imóveis</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Ca, S, Fe, Mn, Zn, B, Cu — não podem ser redistribuídos. Sintomas aparecem no <strong className="text-foreground">novo crescimento (topo)</strong> primeiro.</p>
          </div>
        </div>
      </MotionItem>

      {/* pH reminder */}
      <MotionItem>
        <div className="bg-card border border-border rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">pH incorreto é a causa #1</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Antes de suplementar, verifique o pH. Solo: <strong className="text-foreground">6.0–7.0</strong> (ideal ~6.3). Hidro: <strong className="text-foreground">5.5–6.5</strong>. Nutrientes fisicamente presentes podem ficar bloqueados por pH incorreto.
            </p>
          </div>
        </div>
      </MotionItem>

      {/* Filters */}
      <MotionItem>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">
            {filtered.length} nutriente{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </MotionItem>

      {/* Nutrient list */}
      <div className="space-y-2">
        {filtered.map((n) => (
          <NutrientCard key={n.id} nutrient={n} />
        ))}
      </div>
    </MotionPage>
  );
}
