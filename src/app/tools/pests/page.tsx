"use client";

import { useState } from "react";
import { PESTS, type Pest, type PestSeverity } from "@/lib/tools-data/pests";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldAlert, Leaf, FlaskConical, CheckCircle2, AlertTriangle, Bug } from "lucide-react";

const SEVERITY_CONFIG: Record<PestSeverity, { label: string; color: string; bg: string }> = {
  high: { label: "Risco Alto", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  medium: { label: "Risco Médio", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  low: { label: "Risco Baixo", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

function PestCard({ pest }: { pest: Pest }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"identify" | "treat" | "prevent">("identify");
  const severity = SEVERITY_CONFIG[pest.severity];

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
        <span className="text-2xl shrink-0">{pest.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{pest.name}</p>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block", severity.bg, severity.color)}>
            {severity.label}
          </span>
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
                <p className="text-[11px] text-muted-foreground leading-relaxed">{pest.description}</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-3">
                {(["identify", "treat", "prevent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                      tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {t === "identify" ? "Identificar" : t === "treat" ? "Tratar" : "Prevenir"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "identify" && (
                  <motion.div
                    key="identify"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Como Identificar</p>
                      <ul className="space-y-1">
                        {pest.identification.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <span className="text-primary mt-0.5 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Danos na Planta</p>
                      <ul className="space-y-1">
                        {pest.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {pest.lifecycle && (
                      <div className="bg-muted/20 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Ciclo de Vida</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{pest.lifecycle}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Condições Favoráveis</p>
                      <ul className="space-y-1">
                        {pest.favorableConditions.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <span className="text-destructive mt-0.5 shrink-0">!</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {tab === "treat" && (
                  <motion.div
                    key="treat"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Leaf size={12} className="text-primary" />
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tratamentos Orgânicos</p>
                      </div>
                      <div className="space-y-2">
                        {pest.organicTreatments.map((t, i) => (
                          <div key={i} className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                            <p className="text-xs font-semibold text-primary mb-0.5">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {pest.chemicalTreatments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <FlaskConical size={12} className="text-amber-400" />
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tratamentos Químicos</p>
                        </div>
                        <div className="space-y-2">
                          {pest.chemicalTreatments.map((t, i) => (
                            <div key={i} className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-400 mb-0.5">{t.name}</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
                              {t.warning && (
                                <div className="flex items-start gap-1.5 mt-1.5">
                                  <AlertTriangle size={10} className="text-destructive shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-destructive leading-relaxed">{t.warning}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {tab === "prevent" && (
                  <motion.div
                    key="prevent"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 pb-4 pt-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Prevenção</p>
                    <ul className="space-y-2">
                      {pest.prevention.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/90">
                          <CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" />
                          {p}
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

export default function PestsToolPage() {
  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
            <Bug size={20} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Identificação de Pragas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Identifique, trate e previna as principais pragas do cultivo de cannabis.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 flex items-start gap-2.5">
          <ShieldAlert size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Quarentena é essencial:</strong> novas plantas, clones e ferramentas são as principais vias de entrada de pragas. Inspecione com lupa 10x regularmente.
          </p>
        </div>
      </MotionItem>

      <div className="space-y-2">
        {PESTS.map((pest) => (
          <PestCard key={pest.id} pest={pest} />
        ))}
      </div>
    </MotionPage>
  );
}
