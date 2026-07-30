"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteSpace } from "@/lib/spaces";
import { getSpaceMeta, getLightMeta } from "@/lib/space-constants";
import type { GrowSpace, Plant } from "@/lib/types";
import { Pencil, Trash2, Wind, Zap, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceCardProps {
  space: GrowSpace;
  plants: Plant[];
  onEdit: (space: GrowSpace) => void;
  onDeleted: () => void;
}

export function SpaceCard({ space, plants, onEdit, onDeleted }: SpaceCardProps) {
  const [deleting, setDeleting] = useState(false);
  const spaceMeta = getSpaceMeta(space.type);
  const lightMeta = getLightMeta(space.lightType);
  const plantCount = plants.filter((p) => p.spaceId === space.id).length;
  const area =
    space.widthCm && space.depthCm
      ? ((space.widthCm * space.depthCm) / 10000).toFixed(2)
      : null;

  async function handleDelete() {
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
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link href={`/spaces/${space.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity">
          <span className="text-2xl shrink-0">{spaceMeta.emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">{space.name}</p>
            <p className="text-xs text-muted-foreground">{spaceMeta.label}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(space)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {area && (
          <div className="flex items-center gap-1.5 bg-background rounded-lg px-3 py-2">
            <Ruler size={13} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Área</p>
              <p className="text-xs font-semibold text-foreground">{area} m²</p>
            </div>
          </div>
        )}
        {space.heightCm > 0 && (
          <div className="flex items-center gap-1.5 bg-background rounded-lg px-3 py-2">
            <span className="text-muted-foreground text-[11px] shrink-0">↕</span>
            <div>
              <p className="text-[10px] text-muted-foreground">Altura</p>
              <p className="text-xs font-semibold text-foreground">{space.heightCm} cm</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-background rounded-lg px-3 py-2">
          <Zap size={13} className={cn("shrink-0", lightMeta.color)} />
          <div>
            <p className="text-[10px] text-muted-foreground">Luz</p>
            <p className="text-xs font-semibold text-foreground">
              {lightMeta.label}
              {space.lightWatts ? ` ${space.lightWatts}W` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-background rounded-lg px-3 py-2">
          <Wind size={13} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Ventilação</p>
            <p className="text-xs font-semibold text-foreground">
              {space.ventInputs}↓ {space.ventOutputs}↑
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Schedule: <span className="text-foreground font-medium">{space.lightSchedule}</span>
        </p>
        <div className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          plantCount > 0
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {plantCount} {plantCount === 1 ? "planta" : "plantas"}
        </div>
      </div>

      {space.notes && (
        <p className="text-xs text-muted-foreground italic line-clamp-2 border-t border-border pt-2">
          {space.notes}
        </p>
      )}
    </div>
  );
}
