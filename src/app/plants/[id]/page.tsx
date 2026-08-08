"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlant, deletePlant, advanceStage, archivePlant } from "@/lib/plants";
import { STAGE_LABELS, STAGE_ORDER, STAGE_COLORS, STAGE_DOT, ENV_LABELS, MEDIUM_LABELS } from "@/lib/constants";
import type { Plant, GrowStage } from "@/lib/types";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Leaf, Calendar, Droplets, FlaskConical, Pencil, Trash2,
  ChevronRight, ChevronLeft, ArrowLeft, Thermometer, Sprout, Dna, Clock,
  TrendingUp, BookOpen, History, Archive,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const GENETICS_LABEL: Record<string, string> = {
  sativa: "Sativa",
  indica: "Indica",
  hibrida: "Híbrida",
  autoflowering: "Autoflowering",
};

const GENETICS_COLOR: Record<string, string> = {
  sativa:       "bg-green-500/10 text-green-400 border-green-500/30",
  indica:       "bg-purple-500/10 text-purple-400 border-purple-500/30",
  hibrida:      "bg-blue-500/10 text-blue-400 border-blue-500/30",
  autoflowering: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [regressing, setRegressing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

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

  async function handleRegressStage() {
    if (!plant) return;
    const idx = STAGE_ORDER.indexOf(plant.stage);
    const prev = STAGE_ORDER[idx - 1];
    if (!prev) return;
    if (!confirm(`Regredir para "${STAGE_LABELS[prev]}"? O contador de tempo desta fase será reiniciado.`)) return;
    setRegressing(true);
    await advanceStage(id, prev);
    setPlant((p) => p ? { ...p, stage: prev, stageChangedAt: new Date().toISOString() } : p);
    setRegressing(false);
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta planta? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    await deletePlant(id);
    router.push("/plants");
  }

  async function handleArchive() {
    if (!confirm("Encerrar este cultivo? A planta será movida para o Arquivo e não aparecerá na lista ativa.")) return;
    setArchiving(true);
    await archivePlant(id);
    router.push("/archive");
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 bg-card" />
        <Skeleton className="h-56 rounded-2xl bg-card" />
        <Skeleton className="h-40 rounded-2xl bg-card" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-24 p-4">
        <p className="text-muted-foreground">Planta não encontrada.</p>
        <Link href="/plants" className="text-primary text-sm mt-2 inline-block">← Voltar para plantas</Link>
      </div>
    );
  }

  const age = plant.germinationDate ? differenceInDays(new Date(), parseISO(plant.germinationDate)) : 0;
  const daysInStage = plant.stageChangedAt ? differenceInDays(new Date(), parseISO(plant.stageChangedAt)) : 0;
  const stageIdx = STAGE_ORDER.indexOf(plant.stage);
  const nextStage = STAGE_ORDER[stageIdx + 1] as GrowStage | undefined;
  const prevStage = STAGE_ORDER[stageIdx - 1] as GrowStage | undefined;
  const isOwner = user?.uid === plant.userId;

  const hasStrainData = plant.genetics || plant.floweringWeeks || plant.thcEstimate ||
    plant.cbdEstimate || plant.yieldIndoor || plant.yieldOutdoor;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Nav */}
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
              className="gap-1.5 border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleArchive}
              disabled={archiving}
            >
              <Archive size={13} />
              {archiving ? "Encerrando..." : "Encerrar"}
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
        )}
      </div>

      {/* Hero */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 h-48 sm:h-auto bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center shrink-0">
            {plant.photoUrl ? (
              <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl opacity-30">🌿</span>
            )}
          </div>

          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{plant.name}</h1>
                <p className="text-muted-foreground">{plant.strain}</p>
                {plant.bank && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{plant.bank}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium", STAGE_COLORS[plant.stage])}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", STAGE_DOT[plant.stage])} />
                  {STAGE_LABELS[plant.stage]}
                </span>
                {plant.genetics && (
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium", GENETICS_COLOR[plant.genetics])}>
                    {GENETICS_LABEL[plant.genetics]}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: Calendar,     label: "Idade",     value: `${age}d`,         color: "text-primary" },
                { icon: Sprout,       label: "Na fase",   value: `${daysInStage}d`, color: "text-accent" },
                { icon: Leaf,         label: "Ambiente",  value: ENV_LABELS[plant.environment], color: "text-green-400" },
                { icon: FlaskConical, label: "Substrato", value: MEDIUM_LABELS[plant.medium],   color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-background rounded-xl p-3 border border-border">
                  <s.icon size={13} className={cn(s.color, "mb-1")} />
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-semibold text-foreground">{s.value}</p>
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

      {/* Dados da Strain */}
      {hasStrainData && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Dna size={14} />
              Dados da Strain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plant.floweringWeeks && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <Clock size={13} className="text-accent mb-1" />
                  <p className="text-[10px] text-muted-foreground">Floração</p>
                  <p className="text-xs font-semibold text-foreground">{plant.floweringWeeks} semanas</p>
                </div>
              )}
              {plant.thcEstimate && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <span className="text-[11px] font-bold text-green-400 block mb-1">THC</span>
                  <p className="text-[10px] text-muted-foreground">Estimado</p>
                  <p className="text-xs font-semibold text-foreground">{plant.thcEstimate}</p>
                </div>
              )}
              {plant.cbdEstimate && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <span className="text-[11px] font-bold text-blue-400 block mb-1">CBD</span>
                  <p className="text-[10px] text-muted-foreground">Estimado</p>
                  <p className="text-xs font-semibold text-foreground">{plant.cbdEstimate}</p>
                </div>
              )}
              {plant.yieldIndoor && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <TrendingUp size={13} className="text-primary mb-1" />
                  <p className="text-[10px] text-muted-foreground">Produção Indoor</p>
                  <p className="text-xs font-semibold text-foreground">{plant.yieldIndoor}</p>
                </div>
              )}
              {plant.yieldOutdoor && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <TrendingUp size={13} className="text-green-400 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Produção Outdoor</p>
                  <p className="text-xs font-semibold text-foreground">{plant.yieldOutdoor}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações do Banco */}
      {plant.bankRecommendations && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} />
              Recomendações do Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{plant.bankRecommendations}</p>
          </CardContent>
        </Card>
      )}

      {/* Progresso */}
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
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                      current ? "border-primary bg-primary/20 scale-110" :
                      done ? "border-primary/60 bg-primary/10" : "border-border bg-background"
                    )}>
                      {done ? (
                        <span className="text-primary text-xs">✓</span>
                      ) : (
                        <span className={cn("w-2 h-2 rounded-full", current ? "bg-primary" : "bg-border")} />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] text-center hidden sm:block",
                      current ? "text-primary font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/50"
                    )}>
                      {STAGE_LABELS[s]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={cn("h-0.5 flex-1 mx-1 rounded", i < stageIdx ? "bg-primary/40" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>

          {(prevStage || nextStage) && (
            <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
              <div>
                {prevStage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegressStage}
                    disabled={regressing || advancing}
                    className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft size={13} />
                    {regressing ? "Regredindo..." : STAGE_LABELS[prevStage]}
                  </Button>
                )}
              </div>
              <div>
                {nextStage && (
                  <Button
                    size="sm"
                    onClick={handleAdvanceStage}
                    disabled={advancing || regressing}
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {advancing ? "Avançando..." : STAGE_LABELS[nextStage]}
                    <ChevronRight size={13} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de cultivos anteriores */}
      {plant.previousGrowNotes && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <History size={14} />
              Histórico de Cultivos Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{plant.previousGrowNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Anotações do cultivo atual */}
      {plant.notes && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Anotações do Cultivo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground/50 text-center pb-2">
        Cadastrada em {format(parseISO(plant.createdAt || new Date().toISOString()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </p>
    </div>
  );
}
