"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlants } from "@/hooks/use-plants";
import { useSpaces } from "@/hooks/use-spaces";
import { useDiary } from "@/hooks/use-diary";
import { generateTips, type Tip, type TipSeverity } from "@/lib/tips";
import { Lightbulb, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_STYLE: Record<
  TipSeverity,
  { bar: string; bg: string; badge: string; glow: string }
> = {
  alert: {
    bar: "bg-destructive",
    bg: "bg-destructive/5 border-destructive/20",
    badge: "bg-destructive/15 text-destructive",
    glow: "shadow-[inset_2px_0_0_oklch(0.60_0.22_27)]",
  },
  warning: {
    bar: "bg-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    badge: "bg-amber-400/15 text-amber-400",
    glow: "shadow-[inset_2px_0_0_#fbbf24]",
  },
  info: {
    bar: "bg-primary",
    bg: "bg-primary/5 border-primary/20",
    badge: "bg-primary/15 text-primary",
    glow: "",
  },
};

function TipCard({ tip, index }: { tip: Tip; index: number }) {
  const s = SEVERITY_STYLE[tip.severity];
  const isAlert = tip.severity === "alert" || tip.severity === "warning";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.01, y: -1 }}
      style={{ willChange: "transform" }}
      className={cn(
        "relative flex gap-3 rounded-xl border p-3 transition-all",
        s.bg,
        isAlert && "animate-glow-pulse-border",
        tip.href && "hover:border-primary/40 cursor-pointer"
      )}
    >
      {/* Left accent bar — pulses for alerts */}
      <div
        className={cn(
          "absolute left-0 top-2 bottom-2 w-0.5 rounded-full",
          s.bar,
          isAlert && "animate-glow-pulse"
        )}
      />
      <span className="text-base shrink-0 mt-0.5">{tip.emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">
          {tip.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug">{tip.body}</p>
      </div>
      {tip.href && (
        <ChevronRight size={13} className="shrink-0 text-muted-foreground/50 self-center" />
      )}
    </motion.div>
  );

  if (tip.href) {
    return <Link href={tip.href}>{inner}</Link>;
  }
  return inner;
}

export function SmartTipsPanel() {
  const { plants } = usePlants();
  const { spaces } = useSpaces();
  const { entries } = useDiary();
  const tips = useMemo(
    () => generateTips(plants, spaces, entries),
    [plants, spaces, entries]
  );

  const alerts = tips.filter((t) => t.severity === "alert").length;
  const warnings = tips.filter((t) => t.severity === "warning").length;
  const total = tips.length;

  return (
    <aside className="w-72 shrink-0 hidden xl:flex flex-col gap-3 self-start sticky top-6">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb size={15} className="text-accent" />
        <span className="text-sm font-semibold text-foreground">Dicas do Cultivo</span>
        {total > 0 && (
          <span
            className={cn(
              "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
              alerts > 0
                ? "bg-destructive/15 text-destructive"
                : warnings > 0
                ? "bg-amber-400/15 text-amber-400"
                : "bg-primary/15 text-primary"
            )}
          >
            {total}
          </span>
        )}
      </div>

      {total === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 text-center"
        >
          <span className="text-3xl block mb-2">✅</span>
          <p className="text-xs font-medium text-foreground">Tudo certo!</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Nenhuma ação necessária agora.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <TipCard key={tip.id} tip={tip} index={i} />
          ))}
        </div>
      )}
    </aside>
  );
}

// ── Mobile: botão flutuante + sheet de dicas ──────────────────
export function SmartTipsMobile() {
  const { plants } = usePlants();
  const { spaces } = useSpaces();
  const { entries } = useDiary();
  const tips = useMemo(
    () => generateTips(plants, spaces, entries),
    [plants, spaces, entries]
  );

  const [open, setOpen] = useState(false);
  const urgent = tips.filter((t) => t.severity !== "info").length;

  if (tips.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="xl:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/40 rounded-full px-3.5 py-2.5 text-xs font-semibold text-foreground hover:border-primary/40 transition-all"
      >
        <Lightbulb size={14} className="text-accent" />
        Dicas
        {urgent > 0 && (
          <span className="w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {urgent}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="relative bg-card border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Lightbulb size={15} className="text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    Dicas do Cultivo
                  </span>
                </div>
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2">
                {tips.map((tip, i) => (
                  <div key={tip.id} onClick={() => setOpen(false)}>
                    <TipCard tip={tip} index={i} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
