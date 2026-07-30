"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, FlaskConical, Sun, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STAGE_COLORS: Record<string, string> = {
  semente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  muda: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  vegetativo: "bg-green-500/10 text-green-400 border-green-500/20",
  floracao: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  colheita: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  secagem: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STAGE_LABELS: Record<string, string> = {
  semente: "Semente",
  muda: "Muda",
  vegetativo: "Vegetativo",
  floracao: "Floração",
  colheita: "Colheita",
  secagem: "Secagem",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "Grower";

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
          { label: "Plantas Ativas", value: "0", icon: Leaf, color: "text-primary", bg: "bg-primary/10" },
          { label: "Em Floração", value: "0", icon: Sun, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Regas Hoje", value: "0", icon: Droplets, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Nutrições", value: "0", icon: FlaskConical, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
                Suas Plantas
              </CardTitle>
              <Link href="/plants" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Ver todas →
              </Link>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Leaf size={32} className="text-muted-foreground/40" />}
                title="Nenhuma planta cadastrada"
                description="Adicione sua primeira planta para começar a monitorar seu cultivo."
                action={
                  <Link href="/plants/new">
                    <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus size={14} />
                      Adicionar Planta
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Atividade recente */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<TrendingUp size={28} className="text-muted-foreground/40" />}
                title="Sem atividade"
                description="Registre regas e nutrições para ver o histórico aqui."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fases do cultivo */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Distribuição por Fase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${STAGE_COLORS[key]}`}>
                  {label}
                </span>
                <span className="text-sm font-medium text-muted-foreground">0</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
      {icon}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">{description}</p>
      </div>
      {action}
    </div>
  );
}
