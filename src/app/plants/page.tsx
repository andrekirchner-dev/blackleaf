"use client";

import { Plus, Leaf, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlantsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie todas as plantas do seu cultivo</p>
        </div>
        <Link href="/plants/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            Nova Planta
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar planta..." className="pl-9 bg-card border-border" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Leaf size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Nenhuma planta ainda</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Adicione sua primeira planta e comece a acompanhar seu cultivo com precisão.
          </p>
        </div>
        <Link href="/plants/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />
            Adicionar Primeira Planta
          </Button>
        </Link>
      </div>
    </div>
  );
}
