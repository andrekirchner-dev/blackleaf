"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlant, deletePlant, advanceStage } from "@/lib/plants";
import { STAGE_LABELS, STAGE_ORDER, STAGE_COLORS, STAGE_DOT, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage } from "@/lib/types";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Leaf, Calendar, Droplets, FlaskConical, Pencil, Trash2,
  ChevronRight, ArrowLeft, Thermometer, Sprout,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getPlant(id).then(setPlant).finally(() => setLoading(false));
  }, [id]);

  async function handleAdvanceStage() {
    if (!plant) return;
    const idx = STAGE_ORDER.indexOf(plant.stage);
    const next = STAGE_ORDER[idx + 1];
    if (!next) return;
    setAdvancing(true);
    await advanceStage(id, next);
    setPlant((p) => p ? { ...p, stage: next, stageChangedAt: new Date().toISOString() } : p);
    setAdvancing(false);
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta planta? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    await deletePlant(id);
    router.push("/plants");
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 bg-card" />
        <Skeleton className="h-56 rounded-2xl bg-card" />
        <Skeleton className="h-40 rounded-2xl bg-card" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Planta não encontrada.</p>
        <Link href="/plants" className="text-primary text-sm mt-2 inline-block">← Voltar para plantas</Link>
      </div>
    );
  }

  const age = differenceInDays(new Date(), parseISO(plant.germinationDate));
  const daysInStage = differenceInDays(new Date(), parseISO(plant.stageChangedAt));
  const stageIdx = STAGE_ORDER.indexOf(plant.stage);
  const nextStage = STAGE_ORDER[stageIdx + 1] as GrowStage | undefined;
  const isOwner = user?.uid === plant.userId;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/plants" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} />
          Plantas
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/plants/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5 border-border">
                <Pencil size={13} />
                Editar
              </Button>
            </Link>
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
        )}
      </div>

      {/* Hero card */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Photo */}
          <div className="sm:w-56 h-48 sm:h-auto bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center shrink-0">
            {plant.photoUrl ? (
              <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl opacity-30">🌿</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{plant.name}</h1>
                <p className="text-muted-foreground">{plant.strain}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STAGE_COLORS[plant.stage]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[plant.stage]}`} />
                {STAGE_LABELS[plant.stage]}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar, label: "Idade", value: `${age} dias`, color: "text-primary" },
                { icon: Sprout, label: "Na fase", value: `${daysInStage} dias`, color: "text-accent" },
                { icon: Leaf, label: "Ambiente", value: ENV_LABELS[plant.environment], color: "text-green-400" },
                { icon: FlaskConical, label: "Substrato", value: MEDIUM_LABELS[plant.medium], color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-background rounded-xl p-3 border border-border">
                  <s.icon size={14} className={`${s.color} mb-1`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {plant.potSize && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Droplets size={13} className="text-blue-400" />
                Vaso de <span className="text-foreground font-medium">{plant.potSize}L</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Fase progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Thermometer size={14} />
            Progresso do Cultivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1">
            {STAGE_ORDER.map((s, i) => {
              const done = i < stageIdx;
              const current = i === stageIdx;
              const isLast = i === STAGE_ORDER.length - 1;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      current ? "border-primary bg-primary/20 scale-110" :
                      done ? "border-primary/60 bg-primary/10" :
                      "border-border bg-background"
                    }`}>
                      {done ? (
                        <span className="text-primary text-xs">✓</span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${current ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <span className={`text-[10px] text-center hidden sm:block ${current ? "text-primary font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                      {STAGE_LABELS[s]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 flex-1 mx-1 rounded ${i < stageIdx ? "bg-primary/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {nextStage && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Próxima fase: <span className="text-foreground font-medium">{STAGE_LABELS[nextStage]}</span>
              </p>
              <Button
                size="sm"
                onClick={handleAdvanceStage}
                disabled={advancing}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Avançar para {STAGE_LABELS[nextStage]}
                <ChevronRight size={13} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {plant.notes && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer info */}
      <p className="text-xs text-muted-foreground/50 text-center">
        Cadastrada em {format(parseISO(plant.createdAt as unknown as string || new Date().toISOString()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </p>
    </div>
  );
}
