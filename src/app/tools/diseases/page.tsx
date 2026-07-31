"use client";

import { useState } from "react";
import { DISEASES, type Disease, type DiseaseSeverity, type DiseaseLocation } from "@/lib/tools-data/diseases";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldAlert, Leaf, FlaskConical, CheckCircle2, AlertTriangle, Stethoscope, XCircle } from "lucide-react";

const SEVERITY_CONFIG: Record<DiseaseSeverity, { label: string; color: string; bg: string }> = {
  critical: { label: "Crítico", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  high: { label: "Risco Alto", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  medium: { label: "Risco Médio", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

const LOCATION_LABELS: Record<DiseaseLocation, { label: string; emoji: string }> = {
  aerial: { label: "Parte Aérea", emoji: "🌿" },
  root: { label: "Raízes", emoji: "🪱" },
  vascular: { label: "Sistema Vascular", emoji: "🩸" },
  seedling: { label: "Mudas", emoji: "🌱" },
};

type FilterType = "all" | "aerial" | "root" | "fungal";

function DiseaseCard({ disease }: { disease: Disease }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"identify" | "treat" | "prevent">("identify");
  const severity = SEVERITY_CONFIG[disease.severity];
  const location = LOCATION_LABELS[disease.location];

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
        <span className="text-2xl shrink-0">{disease.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{disease.name}</p>
          </div>
          <p className="text-[10px] text-muted-foreground italic truncate mb-1">{disease.pathogen}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", severity.bg, severity.color)}>
              {severity.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {location.emoji} {location.label}
            </span>
            {!disease.isCurable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-0.5">
                <XCircle size={9} /> Sem cura
              </span>
            )}
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
              <div className="px-4 py-3 bg-muted/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{disease.description}</p>
              </div>

              {disease.curingNote && (
                <div className={cn(
                  "mx-4 mt-3 px-3 py-2 rounded-xl border flex items-start gap-2",
                  disease.isCurable ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"
                )}>
                  {disease.isCurable
                    ? <CheckCircle2 size={12} className="text-primary shrink-0 mt-0.5" />
                    : <XCircle size={12} className="text-destructive shrink-0 mt-0.5" />
                  }
                  <p className={cn("text-[11px] font-medium", disease.isCurable ? "text-primary" : "text-destructive")}>
                    {disease.curingNote}
                  </p>
                </div>
              )}

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
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Sintomas e Identificação</p>
                      <ul className="space-y-1.5">
                        {disease.identification.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/90">
                            <span className="text-primary mt-0.5 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Condições Favoráveis</p>
                      <ul className="space-y-1">
                        {disease.favorableConditions.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" />
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
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3 space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Leaf size={12} className="text-primary" />
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tratamentos Orgânicos</p>
                      </div>
                      <div className="space-y-2">
                        {disease.organicTreatments.map((t, i) => (
                          <div key={i} className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                            <p className="text-xs font-semibold text-primary mb-0.5">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {disease.chemicalTreatments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <FlaskConical size={12} className="text-amber-400" />
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tratamentos Químicos</p>
                        </div>
                        <div className="space-y-2">
                          {disease.chemicalTreatments.map((t, i) => (
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
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4 pt-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Prevenção</p>
                    <ul className="space-y-2">
                      {disease.prevention.map((p, i) => (
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

export default function DiseasesToolPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = DISEASES.filter((d) => {
    if (filter === "aerial") return d.location === "aerial";
    if (filter === "root") return d.location === "root" || d.location === "vascular" || d.location === "seedling";
    if (filter === "fungal") return d.type === "fungal" || d.type === "oomycete";
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "aerial", label: "Parte Aérea" },
    { key: "root", label: "Raízes/Solo" },
    { key: "fungal", label: "Fúngicas" },
  ];

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Stethoscope size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Diagnóstico de Doenças</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Identifique e trate as principais doenças fúngicas do cultivo de cannabis.
            </p>
          </div>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 flex items-start gap-2.5">
          <ShieldAlert size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Prevenção é sempre superior ao tratamento.</strong> A maioria das doenças fúngicas não tem cura — propagam-se por esporos aéreos. Controle ambiental (UR, temperatura, ventilação) é a primeira linha de defesa.
          </p>
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
            {filtered.length} doença{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </MotionItem>

      <div className="space-y-2">
        {filtered.map((d) => (
          <DiseaseCard key={d.id} disease={d} />
        ))}
      </div>
    </MotionPage>
  );
}
