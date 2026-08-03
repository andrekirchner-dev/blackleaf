"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getArchivedPlants, unarchivePlant } from "@/lib/plants";
import { STAGE_LABELS, STAGE_COLORS, STAGE_DOT } from "@/lib/constants";
import type { Plant } from "@/lib/types";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Archive, RotateCcw, Leaf, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

export default function ArchivePage() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getArchivedPlants(user.uid);
      setPlants(data);
    } catch {
      setPlants([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleRestore(id: string) {
    setRestoring(id);
    await unarchivePlant(id);
    await load();
    setRestoring(null);
  }

  return (
    <MotionPage>
    <div className="max-w-4xl mx-auto space-y-5 p-4 md:p-6">
      <MotionItem>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Archive size={22} className="text-muted-foreground" />
          Arquivo de Cultivos
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cultivos encerrados — {plants.length > 0 ? `${plants.length} registro${plants.length > 1 ? "s" : ""}` : "nenhum cultivo arquivado ainda"}
        </p>
      </div>
      </MotionItem>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-card" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <MotionItem>
        <div className="text-center py-24 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
            <Archive size={28} className="text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">Nenhum cultivo arquivado.</p>
          <p className="text-sm text-muted-foreground/60">
            Encerre um cultivo na página da planta para movê-lo para o arquivo.
          </p>
          <Link href="/plants">
            <Button variant="outline" size="sm" className="border-border gap-2 mt-2">
              <Leaf size={14} />
              Ver plantas ativas
            </Button>
          </Link>
        </div>
        </MotionItem>
      ) : (
        <MotionItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plants.map((plant) => {
            const age = plant.germinationDate
              ? differenceInDays(
                  plant.archivedAt ? parseISO(plant.archivedAt) : new Date(),
                  parseISO(plant.germinationDate)
                )
              : null;

            return (
              <div
                key={plant.id}
                className="bg-card border border-border rounded-2xl overflow-hidden flex"
              >
                {/* Photo or placeholder */}
                <div className="w-20 shrink-0 bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
                  {plant.photoUrl ? (
                    <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl opacity-20">🌿</span>
                  )}
                </div>

                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/plants/${plant.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block">
                        {plant.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{plant.strain}</p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium shrink-0",
                      STAGE_COLORS[plant.stage]
                    )}>
                      <span className={cn("w-1 h-1 rounded-full", STAGE_DOT[plant.stage])} />
                      {STAGE_LABELS[plant.stage]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {age !== null && (
                      <span className="flex items-center gap-1">
                        <Leaf size={11} />
                        {age}d de cultivo
                      </span>
                    )}
                    {plant.archivedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {format(parseISO(plant.archivedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(plant.id)}
                    disabled={restoring === plant.id}
                    className="mt-2.5 h-7 text-xs gap-1.5 border-border"
                  >
                    <RotateCcw size={11} />
                    {restoring === plant.id ? "Restaurando..." : "Reativar Cultivo"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        </MotionItem>
      )}
    </div>
    </MotionPage>
  );
}
