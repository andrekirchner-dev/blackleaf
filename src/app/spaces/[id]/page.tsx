"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSpace, deleteSpace } from "@/lib/spaces";
import { usePlants } from "@/hooks/use-plants";
import { getSpaceMeta, getLightMeta, LIGHT_SCHEDULES } from "@/lib/space-constants";
import { SpaceForm } from "@/components/spaces/space-form";
import { PlantCard } from "@/components/plants/plant-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GrowSpace } from "@/lib/types";
import {
  ArrowLeft, Pencil, Trash2, Ruler, Zap, Wind,
  Clock, Leaf, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { plants } = usePlants();

  const [space, setSpace] = useState<GrowSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSpace(id).then(setSpace).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Deletar "${space?.name}"? As plantas não serão removidas.`)) return;
    setDeleting(true);
    await deleteSpace(id);
    router.push("/spaces");
  }

  function handleEditSuccess() {
    setSheetOpen(false);
    getSpace(id).then(setSpace);
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-7 w-40 bg-card" />
        <Skeleton className="h-44 rounded-2xl bg-card" />
        <Skeleton className="h-32 rounded-2xl bg-card" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="text-center py-24 p-4">
        <p className="text-muted-foreground">Espaço não encontrado.</p>
        <Link href="/spaces" className="text-primary text-sm mt-2 inline-block">← Voltar para espaços</Link>
      </div>
    );
  }

  const spaceMeta = getSpaceMeta(space.type);
  const lightMeta = getLightMeta(space.lightType);
  const spaceSchedule = LIGHT_SCHEDULES.find((s) => s.value === space.lightSchedule);
  const spacePlants = plants.filter((p) => p.spaceId === space.id);
  const area = space.widthCm && space.depthCm
    ? ((space.widthCm * space.depthCm) / 10000).toFixed(2)
    : null;
  const volume = space.widthCm && space.depthCm && space.heightCm
    ? ((space.widthCm * space.depthCm * space.heightCm) / 1_000_000).toFixed(2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5 max-w-4xl mx-auto"
    >
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/spaces"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Espaços
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border"
            onClick={() => setSheetOpen(true)}
          >
            <Pencil size={13} />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={13} />
            Excluir
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-5 py-4 flex items-center gap-4">
          <span className="text-4xl">{spaceMeta.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-foreground">{space.name}</h1>
            <p className="text-sm text-muted-foreground">{spaceMeta.label}</p>
          </div>
          <div className={cn(
            "ml-auto px-3 py-1 rounded-full text-xs font-medium",
            spacePlants.length > 0
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {spacePlants.length} {spacePlants.length === 1 ? "planta" : "plantas"}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {area && (
            <StatCell icon={<Ruler size={14} className="text-primary" />} label="Área" value={`${area} m²`} />
          )}
          {volume && (
            <StatCell icon={<span className="text-sm text-muted-foreground">m³</span>} label="Volume" value={`${volume} m³`} />
          )}
          <StatCell
            icon={<Zap size={14} className={lightMeta.color} />}
            label="Iluminação"
            value={`${lightMeta.label}${space.lightWatts ? ` · ${space.lightWatts}W` : ""}`}
          />
          <StatCell
            icon={<Clock size={14} className="text-accent" />}
            label="Schedule"
            value={spaceSchedule?.label ?? space.lightSchedule}
          />
          <StatCell
            icon={<Wind size={14} className="text-blue-400" />}
            label="Ventilação"
            value={`${space.ventInputs} entrada${space.ventInputs !== 1 ? "s" : ""} · ${space.ventOutputs} saída${space.ventOutputs !== 1 ? "s" : ""}`}
          />
          {space.heightCm > 0 && (
            <StatCell icon={<span className="text-sm text-muted-foreground">↕</span>} label="Altura" value={`${space.heightCm} cm`} />
          )}
          {space.widthCm > 0 && space.depthCm > 0 && (
            <StatCell
              icon={<span className="text-sm text-muted-foreground">↔</span>}
              label="Base"
              value={`${space.widthCm} × ${space.depthCm} cm`}
            />
          )}
        </div>
      </div>

      {/* Notes */}
      {space.notes && (
        <div className="bg-card border border-border rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{space.notes}</p>
        </div>
      )}

      {/* Plants section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Leaf size={15} className="text-primary" />
            Plantas neste espaço
          </h2>
          <Link href="/plants/new">
            <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs">
              <Plus size={12} />
              Adicionar planta
            </Button>
          </Link>
        </div>

        {spacePlants.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl px-5 py-10 text-center">
            <span className="text-4xl block mb-3">🌱</span>
            <p className="text-sm text-muted-foreground">Nenhuma planta alocada aqui.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Ao cadastrar uma planta, selecione este espaço.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spacePlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-foreground">Editar Espaço</SheetTitle>
          </SheetHeader>
          <SpaceForm
            space={space}
            onSuccess={handleEditSuccess}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card px-4 py-3 flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}
