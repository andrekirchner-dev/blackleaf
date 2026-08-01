"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { deleteSpace } from "@/lib/spaces";
import { getSpaceMeta, getLightMeta } from "@/lib/space-constants";
import type { GrowSpace, Plant } from "@/lib/types";
import { Pencil, Trash2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const LIGHT_META: Record<string, { bar: string; glow: string; ambient: string }> = {
  led:          { bar: "#7dd3fc", glow: "rgba(125,211,252,0.9)", ambient: "rgba(125,211,252,0.18)" },
  hps:          { bar: "#fbbf24", glow: "rgba(251,191,36,0.9)",  ambient: "rgba(251,191,36,0.18)"  },
  cmh:          { bar: "#fb923c", glow: "rgba(251,146,60,0.9)",  ambient: "rgba(251,146,60,0.18)"  },
  cfl:          { bar: "#34d399", glow: "rgba(52,211,153,0.9)",  ambient: "rgba(52,211,153,0.18)"  },
  fluorescente: { bar: "#86efac", glow: "rgba(134,239,172,0.9)", ambient: "rgba(134,239,172,0.16)" },
  natural:      { bar: "#bef264", glow: "rgba(190,242,100,0.9)", ambient: "rgba(190,242,100,0.16)" },
};

interface SpaceCardProps {
  space: GrowSpace;
  plants: Plant[];
  onEdit: (space: GrowSpace) => void;
  onDeleted: () => void;
}

export function SpaceCard({ space, plants, onEdit, onDeleted }: SpaceCardProps) {
  const router = useRouter();
  const controls = useAnimation();
  const [entering, setEntering] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const spaceMeta = getSpaceMeta(space.type);
  const lightMeta = getLightMeta(space.lightType);
  const plantCount = plants.filter((p) => p.spaceId === space.id).length;
  const area =
    space.widthCm && space.depthCm
      ? ((space.widthCm * space.depthCm) / 10000).toFixed(2)
      : null;

  const lm = LIGHT_META[space.lightType] ?? LIGHT_META.led;

  async function handleEnter() {
    if (entering) return;
    setEntering(true);
    setDoorOpen(true);
    await new Promise((r) => setTimeout(r, 380));
    await controls.start({
      scale: 4,
      opacity: 0,
      filter: "brightness(6) blur(4px)",
      transition: { duration: 0.4, ease: [0.55, 0, 1, 1] },
    });
    router.push(`/spaces/${space.id}`);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Deletar "${space.name}"? As plantas não serão removidas.`)) return;
    setDeleting(true);
    try {
      await deleteSpace(space.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      animate={controls}
      whileHover={entering ? {} : { y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn("relative cursor-pointer group select-none", entering && "z-50")}
      style={{ aspectRatio: "3 / 4" }}
    >
      {/* Inner card — overflow:hidden clips the tent visuals */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-[#1d301e] shadow-2xl shadow-black/60">

        {/* ── EXTERIOR BACKGROUND ── */}
        <div className="absolute inset-0 bg-[#0b1a0c]">
          {/* Fabric weave texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg,#fff,#fff 1px,transparent 1px,transparent 6px)",
            }}
          />
        </div>

        {/* ── FRAME RAILS ── */}
        <div className="absolute left-5 right-5 top-6 h-px bg-[#1d301e]" />
        <div className="absolute left-5 top-6 bottom-[32%] w-px bg-[#1d301e]" />
        <div className="absolute right-5 top-6 bottom-[32%] w-px bg-[#1d301e]" />
        {/* Corner rivets */}
        {(["top-5 left-4", "top-5 right-4"] as const).map((pos) => (
          <div key={pos} className={cn("absolute w-2 h-2 rounded-full bg-[#243524] border border-[#2e4530]", pos)} />
        ))}

        {/* ── LED BAR ── */}
        <motion.div
          className="absolute top-11 left-1/2 -translate-x-1/2 h-1.5 rounded-full"
          animate={
            doorOpen
              ? { boxShadow: `0 0 28px 8px ${lm.glow}`, opacity: 1 }
              : { boxShadow: `0 0 10px 3px ${lm.glow}`, opacity: 0.7 }
          }
          transition={{ duration: 0.3 }}
          style={{ width: "52%", backgroundColor: lm.bar }}
        />
        {/* Secondary light strip */}
        <motion.div
          className="absolute top-11 left-1/2 -translate-x-1/2 h-1 rounded-full blur-md"
          animate={doorOpen ? { opacity: 0.9, width: "70%" } : { opacity: 0.3, width: "52%" }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: lm.bar }}
        />

        {/* ── AMBIENT GLOW from top ── */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2"
          animate={doorOpen ? { opacity: 1 } : { opacity: 0.5 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${lm.ambient}, transparent 75%)`,
          }}
        />

        {/* ── DOOR SECTION ── */}
        <div className="absolute left-9 right-9 top-[36%] bottom-0 overflow-hidden rounded-t-lg">
          {/* Interior behind door */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            animate={doorOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${lm.ambient.replace(/[\d.]+\)$/, "0.55)")}, ${lm.ambient}, transparent)`,
            }}
          >
            {plantCount > 0 && (
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(plantCount, 4) }).map((_, i) => (
                  <span key={i} className="text-xl opacity-50" style={{ filter: `drop-shadow(0 0 6px ${lm.bar})` }}>
                    🌿
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Left door panel */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 origin-left"
            animate={doorOpen ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.36, ease: [0.4, 0, 0.8, 1] }}
            style={{ backgroundColor: "#0d1e0e" }}
          >
            <div className="absolute right-0 top-4 bottom-4 w-px bg-zinc-600/50" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute right-[-2.5px] w-[5px] h-[3px] bg-zinc-500/60 rounded-sm"
                style={{ top: `${8 + i * 11}%` }}
              />
            ))}
          </motion.div>

          {/* Right door panel */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 origin-right"
            animate={doorOpen ? { x: "100%", opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.36, ease: [0.4, 0, 0.8, 1] }}
            style={{ backgroundColor: "#0d1e0e" }}
          >
            <div className="absolute left-0 top-4 bottom-4 w-px bg-zinc-600/50" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-[-2.5px] w-[5px] h-[3px] bg-zinc-500/60 rounded-sm"
                style={{ top: `${8 + i * 11}%` }}
              />
            ))}
          </motion.div>

          {/* Zipper pull */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-5 z-10 flex flex-col items-center"
            animate={doorOpen ? { y: "120%", opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeIn" }}
          >
            <div className="w-4 h-4 rounded-full bg-zinc-600 border border-zinc-400 flex items-center justify-center shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            </div>
            <div className="w-px h-3 bg-zinc-500/60" />
          </motion.div>
        </div>

        {/* ── BOTTOM INFO OVERLAY ── */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pt-10 pb-4 pointer-events-none">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">{space.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[10px] text-zinc-400">{spaceMeta.label}</span>
                {area && <span className="text-[10px] text-zinc-500">· {area} m²</span>}
                {space.lightWatts && (
                  <span className={cn("text-[10px]", lightMeta.color)}>· {space.lightWatts}W</span>
                )}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              {plantCount > 0 && (
                <div className="flex items-center gap-0.5 bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5">
                  <Leaf size={8} className="text-primary" />
                  <span className="text-primary text-[10px] font-bold leading-none">{plantCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── HOVER VIGNETTE ── */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            boxShadow: `inset 0 0 40px 8px ${lm.ambient}`,
          }}
        />
      </div>

      {/* ── EDIT / DELETE BUTTONS (outside overflow:hidden card) ── */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(space);
          }}
          className="p-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white/70 hover:text-destructive transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* ── CLICK OVERLAY to enter ── */}
      <button
        onClick={handleEnter}
        disabled={entering}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`Entrar em ${space.name}`}
      />
    </motion.div>
  );
}
