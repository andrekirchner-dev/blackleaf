"use client";

import { useState } from "react";
import { TRAINING_TECHNIQUES, type TrainingTechnique, type StressLevel, type Difficulty } from "@/lib/tools-data/training";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertTriangle, Scissors, ListOrdered, Zap } from "lucide-react";

const STRESS_CONFIG: Record<StressLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Baixo Estresse", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  medium: { label: "Estresse Médio", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  high: { label: "Alto Estresse", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; dots: number }> = {
  beginner: { label: "Iniciante", dots: 1 },
  intermediate: { label: "Intermediário", dots: 2 },
  advanced: { label: "Avançado", dots: 3 },
};

const STAGE_LABELS: Record<string, string> = {
  seedling: "Muda",
  veg: "Vegetativo",
  "early-flower": "Início da Floração",
  flower: "Floração",
};

type FilterType = "all" | "low" | "high" | "auto" | "beginner";

function TechniqueCard({ technique }: { technique: TrainingTechnique }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"how" | "pros" | "cons">("how");
  const stress = STRESS_CONFIG[technique.stressLevel];
  const difficulty = DIFFICULTY_CONFIG[technique.difficulty];

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
        <span className="text-2xl shrink-0">{technique.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{technique.name}</p>
            {technique.acronym && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-mono">
                {technique.acronym}
              </span>
            )}
            {technique.autoflowerFriendly && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                ⚡ Auto
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", stress.bg, stress.color)}>
              {stress.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {"●".repeat(difficulty.dots)}{"○".repeat(3 - difficulty.dots)} {difficulty.label}
            </span>
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
              {/* Description */}
              <div className="px-4 py-3 bg-muted/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{technique.description}</p>
              </div>

              {/* Meta */}
              <div className="px-4 py-3 flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[120px] bg-muted/20 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Estágio Ideal</p>
                  <p className="text-[11px] font-semibold text-foreground">
                    {technique.idealStage.map((s) => STAGE_LABELS[s]).join(", ")}
                  </p>
                </div>
                {technique.timeImpact && (
                  <div className="flex-1 min-w-[120px] bg-muted/20 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Impacto no Tempo</p>
                    <p className="text-[11px] font-semibold text-foreground">{technique.timeImpact}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-4">
                {(["how", "pros", "cons"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                      tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {t === "how" ? "Como Fazer" : t === "pros" ? "Benefícios" : "Riscos"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "how" && (
                  <motion.div
                    key="how"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <ListOrdered size={12} className="text-primary" />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Passo a Passo</p>
                    </div>
                    <ol className="space-y-2">
                      {technique.howTo.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[11px] text-foreground/90">
                          <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}

                {tab === "pros" && (
                  <motion.div
                    key="pros"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Benefícios</p>
                    <ul className="space-y-1.5">
                      {technique.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                          <CheckCircle2 size={11} className="text-primary mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {tab === "cons" && (
                  <motion.div
                    key="cons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Riscos e Limitações</p>
                    <ul className="space-y-1.5">
                      {technique.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                          <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
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

export default function TrainingToolPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = TRAINING_TECHNIQUES.filter((t) => {
    if (filter === "low") return t.stressLevel === "low";
    if (filter === "high") return t.stressLevel === "high";
    if (filter === "auto") return t.autoflowerFriendly;
    if (filter === "beginner") return t.difficulty === "beginner";
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "low", label: "Baixo Estresse" },
    { key: "high", label: "Alto Estresse" },
    { key: "auto", label: "Para Autos" },
    { key: "beginner", label: "Iniciante" },
  ];

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Scissors size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Guia de Treinamento</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Técnicas de condução e estresse para maximizar produção e controlar o crescimento.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={11} className="text-primary" />
              <span className="text-[11px] font-semibold text-primary">LST (Baixo Estresse)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Dobramentos e amarrações. Planta continua crescendo durante o processo. Ideal para autos e iniciantes.</p>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Scissors size={11} className="text-destructive" />
              <span className="text-[11px] font-semibold text-destructive">HST (Alto Estresse)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Cortes e danos controlados. Requer tempo de recuperação. Não recomendado para autoflowers.</p>
          </div>
        </div>
      </MotionItem>

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
            {filtered.length} técnica{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </MotionItem>

      <div className="space-y-2">
        {filtered.map((t) => (
          <TechniqueCard key={t.id} technique={t} />
        ))}
      </div>
    </MotionPage>
  );
}
