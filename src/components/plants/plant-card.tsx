"use client";

import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { Droplets, Calendar, FlaskConical, ChevronRight } from "lucide-react";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  STAGE_DOT,
  ENV_LABELS,
  MEDIUM_LABELS,
} from "@/lib/constants";
import type { Plant } from "@/lib/types";
import { motion } from "framer-motion";
import { useState } from "react";

export function PlantCard({ plant }: { plant: Plant }) {
  const age = differenceInDays(new Date(), parseISO(plant.germinationDate));
  const daysInStage = differenceInDays(new Date(), parseISO(plant.stageChangedAt));
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-card/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-shadow duration-300 group"
        style={{
          boxShadow: hovered
            ? "0 8px 32px rgba(34,197,94,0.15), 0 2px 8px rgba(0,0,0,0.4)"
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Top shimmer line on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.25 }}
          className="h-px bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
        />

        {/* Photo / placeholder */}
        <div className="h-36 relative overflow-hidden">
          <motion.div
            animate={{
              background: hovered
                ? "linear-gradient(135deg, oklch(0.62 0.18 142 / 0.15), oklch(0.71 0.13 85 / 0.12))"
                : "linear-gradient(135deg, oklch(0.62 0.18 142 / 0.06), oklch(0.62 0.18 142 / 0.10))",
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          />
          {plant.photoUrl ? (
            <img
              src={plant.photoUrl}
              alt={plant.name}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.span
                animate={{ opacity: hovered ? 0.7 : 0.4, scale: hovered ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl"
              >
                🌿
              </motion.span>
            </div>
          )}

          {/* Stage badge */}
          <div
            className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shadow-sm ${STAGE_COLORS[plant.stage]}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-glow-pulse ${STAGE_DOT[plant.stage]}`}
            />
            {STAGE_LABELS[plant.stage]}
          </div>

          {/* Env badge */}
          <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded-full bg-black/50 text-[10px] text-white/70 backdrop-blur-sm border border-white/10">
            {ENV_LABELS[plant.environment]}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
              {plant.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{plant.strain}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-primary/70" />
              <span>{age}d de vida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[plant.stage]}`} />
              <span>{daysInStage}d na fase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FlaskConical size={11} className="text-accent/70" />
              <span>{MEDIUM_LABELS[plant.medium]}</span>
            </div>
            {plant.potSize && (
              <div className="flex items-center gap-1.5">
                <Droplets size={11} className="text-blue-400/70" />
                <span>{plant.potSize}L vaso</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 flex items-center justify-end">
          <motion.span
            animate={{ x: hovered ? 2 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1"
          >
            Ver detalhes <ChevronRight size={12} />
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}
