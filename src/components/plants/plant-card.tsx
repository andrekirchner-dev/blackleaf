"use client";

import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { Droplets, Calendar, FlaskConical, ChevronRight } from "lucide-react";
import { STAGE_LABELS, STAGE_COLORS, STAGE_DOT, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant } from "@/lib/types";

export function PlantCard({ plant }: { plant: Plant }) {
  const age = differenceInDays(new Date(), parseISO(plant.germinationDate));
  const daysInStage = differenceInDays(new Date(), parseISO(plant.stageChangedAt));

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group"
    >
      {/* Photo / placeholder */}
      <div className="h-36 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
        {plant.photoUrl ? (
          <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">🌿</span>
        )}
        {/* Stage badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STAGE_COLORS[plant.stage]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[plant.stage]}`} />
          {STAGE_LABELS[plant.stage]}
        </div>
        {/* Env badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 text-[10px] text-white/70 backdrop-blur-sm">
          {ENV_LABELS[plant.environment]}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
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
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          Ver detalhes <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}
