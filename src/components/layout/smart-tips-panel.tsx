"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlants } from "@/hooks/use-plants";
import { useSpaces } from "@/hooks/use-spaces";
import { useDiary } from "@/hooks/use-diary";
import { generateTips, type Tip, type TipSeverity } from "@/lib/tips";
import { Lightbulb, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<TipSeverity, { bar: string; bg: string; badge: string }> = {
  alert:   { bar: "bg-destructive",       bg: "bg-destructive/5 border-destructive/20",   badge: "bg-destructive/15 text-destructive" },
  warning: { bar: "bg-amber-400",         bg: "bg-amber-500/5 border-amber-500/20",        badge: "bg-amber-400/15 text-amber-400" },
  info:    { bar: "bg-primary",           bg: "bg-primary/5 border-primary/20",            badge: "bg-primary/15 text-primary" },
};

function TipCard({ tip }: { tip: Tip }) {
  const s = SEVERITY_STYLE[tip.severity];
  const inner = (
    <div className={cn("relative flex gap-3 rounded-xl border p-3 transition-all", s.bg, tip.href && "hover:border-primary/40 cursor-pointer")}>
      <div className={cn("absolute left-0 top-2 bottom-2 w-0.5 rounded-full", s.bar)} />
      <span className="text-base shrink-0 mt-0.5">{tip.emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">{tip.title}</p>
        <p className="text-[11px] text-muted-foreground leading-snug">{tip.body}</p>
      </div>
      {tip.href && <ChevronRight size={13} className="shrink-0 text-muted-foreground/50 self-center" />}
    </div>
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
  const tips = useMemo(() => generateTips(plants, spaces, entries), [plants, spaces, entries]);

  const alerts  = tips.filter((t) => t.severity === "alert").length;
  const warnings = tips.filter((t) => t.severity === "warning").length;
  const total = tips.length;

  return (
    <aside className="w-72 shrink-0 hidden xl:flex flex-col gap-3 self-start sticky top-6">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb size={15} className="text-accent" />
        <span className="text-sm font-semibold text-foreground">Dicas do Cultivo</span>
        {total > 0 && (
          <span className={cn(
            "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
            alerts > 0 ? "bg-destructive/15 text-destructive" :
            warnings > 0 ? "bg-amber-400/15 text-amber-400" :
            "bg-primary/15 text-primary"
          )}>
            {total}
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <span className="text-3xl block mb-2">✅</span>
          <p className="text-xs font-medium text-foreground">Tudo certo!</p>
          <p className="text-[11px] text-muted-foreground mt-1">Nenhuma ação necessária agora.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
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
  const tips = useMemo(() => generateTips(plants, spaces, entries), [plants, spaces, entries]);

  const [open, setOpen] = useState(false);
  const urgent = tips.filter((t) => t.severity !== "info").length;

  if (tips.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="xl:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 bg-card border border-border shadow-lg shadow-black/30 rounded-full px-3.5 py-2.5 text-xs font-semibold text-foreground hover:border-primary/40 transition-all"
      >
        <Lightbulb size={14} className="text-accent" />
        Dicas
        {urgent > 0 && (
          <span className="w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {urgent}
          </span>
        )}
      </button>

      {/* Overlay panel */}
      {open && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">Dicas do Cultivo</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {tips.map((tip) => (
                <div key={tip.id} onClick={() => setOpen(false)}>
                  <TipCard tip={tip} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
