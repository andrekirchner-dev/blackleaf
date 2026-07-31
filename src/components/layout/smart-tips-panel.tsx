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
  { bar: string; bg: string; badge: string }
> = {
  alert: {
    bar: "bg-destructive",
    bg: "bg-destructive/5 border-destructive/20",
    badge: "bg-destructive/15 text-destructive",
  },
  warning: {
    bar: "bg-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    badge: "bg-amber-400/15 text-amber-400",
  },
  info: {
    bar: "bg-primary",
    bg: "bg-primary/5 border-primary/20",
    badge: "bg-primary/15 text-primary",
  },
};

function TipCard({ tip, index }: { tip: Tip; index: number }) {
  const s = SEVERITY_STYLE[tip.severity];
  const isAlert = tip.severity === "alert" || tip.severity === "warning";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative flex gap-3 rounded-xl border p-3 transition-all",
        s.bg,
        isAlert && "animate-glow-pulse-border",
        tip.href && "hover:border-primary/40 cursor-pointer"
      )}
    >
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

  return tip.href ? <Link href={tip.href}>{inner}</Link> : inner;
}

function useTips() {
  const { plants } = usePlants();
  const { spaces } = useSpaces();
  const { entries } = useDiary();
  return useMemo(() => generateTips(plants, spaces, entries), [plants, spaces, entries]);
}

// Single unified component — fixed right panel, works on all screen sizes
export function SmartTipsPanel() {
  const tips = useTips();
  const [open, setOpen] = useState(false);

  const alerts = tips.filter((t) => t.severity === "alert").length;
  const warnings = tips.filter((t) => t.severity === "warning").length;
  const urgent = alerts + warnings;
  const total = tips.length;

  return (
    <>
      {/* Toggle tab — fixed to right edge, always visible */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        title={open ? "Fechar dicas" : "Dicas do cultivo"}
        className={cn(
          "fixed right-0 top-1/3 z-40",
          "flex flex-col items-center justify-center gap-1.5",
          "w-7 py-3 rounded-l-xl",
          "bg-card border border-white/10 border-r-0",
          "shadow-lg shadow-black/30",
          "text-muted-foreground hover:text-foreground transition-colors"
        )}
      >
        <Lightbulb size={13} className="text-accent" />
        {urgent > 0 && (
          <span className="w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {urgent}
          </span>
        )}
        <ChevronRight
          size={11}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </motion.button>

      {/* Right sidebar panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 42 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-72 flex flex-col bg-card border-l border-border shadow-2xl shadow-black/50"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
                <Lightbulb size={15} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">Dicas do Cultivo</span>
                {total > 0 && (
                  <span
                    className={cn(
                      "ml-1 text-xs font-bold px-2 py-0.5 rounded-full",
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
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Tips list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {total === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card/80 border border-white/5 rounded-2xl p-5 text-center mt-4"
                  >
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-xs font-medium text-foreground">Tudo certo!</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Nenhuma ação necessária agora.
                    </p>
                  </motion.div>
                ) : (
                  tips.map((tip, i) => <TipCard key={tip.id} tip={tip} index={i} />)
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Keep export so AppShell import doesn't break — renders nothing
export function SmartTipsMobile() {
  return null;
}
