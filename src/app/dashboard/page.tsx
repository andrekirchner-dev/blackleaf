"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePlants } from "@/hooks/use-plants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplets, Sun, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { PlantCard } from "@/components/plants/plant-card";
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from "@/lib/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const { plants, loading } = usePlants();
  const firstName = user?.displayName?.split(" ")[0] ?? "Grower";

  const inFlower = plants.filter((p) => p.stage === "floracao").length;
  const stageCount = STAGE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = plants.filter((p) => p.stage === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, <span className="text-primary">{firstName}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Bem-vindo ao seu painel de cultivo
          </p>
        </div>
        <Link href="/plants/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            Nova Planta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Plantas Ativas", value: loading ? "—" : String(plants.length), icon: Leaf, color: "text-primary", bg: "bg-primary/10" },
          { label: "Em Floração", value: loading ? "—" : String(inFlower), icon: Sun, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Vegetativo", value: loading ? "—" : String(stageCount["vegetativo"] ?? 0), icon: Leaf, color: "text-lime-400", bg: "bg-lime-400/10" },
          { label: "Regas Hoje", value: "0", icon: Droplets, color: "text-blue-400", bg: "bg-blue-400/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-7 w-8 bg-muted mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Plantas recentes */}
        <div className="md:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Leaf size={16} className="text-primary" />
                Plantas Recentes
              </CardTitle>
              <Link href="/plants" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Ver todas →
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl bg-muted" />)}
                </div>
              ) : plants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plants.slice(0, 4).map((p) => <PlantCard key={p.id} plant={p} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <span className="text-4xl opacity-30">🌿</span>
                  <div>
                    <p className="text-sm font-medium">Nenhuma planta cadastrada</p>
                    <p className="text-xs text-muted-foreground mt-1">Adicione sua primeira planta para começar.</p>
                  </div>
                  <Link href="/plants/new">
                    <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus size={14} />
                      Adicionar Planta
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Atividade */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <TrendingUp size={28} className="text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Sem atividade</p>
                <p className="text-xs text-muted-foreground/60">Registre regas e nutrições no Diário.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribuição por fase */}
      {plants.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Distribuição por Fase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {STAGE_ORDER.map((s) => (
                <div key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${STAGE_COLORS[s]}`}>
                    {STAGE_LABELS[s]}
                  </span>
                  <span className="text-sm font-bold text-foreground">{stageCount[s] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
