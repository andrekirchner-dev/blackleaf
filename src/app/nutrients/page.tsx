"use client";

import { FlaskConical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NutrientsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nutrientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle pH, EC e formulações</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} />
          Registrar Nutrição
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
          <FlaskConical size={28} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sem registros de nutrição</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Controle pH, EC e suas formulações de nutrientes por aqui.
          </p>
        </div>
        <Button className="gap-2 bg-purple-500 text-white hover:bg-purple-600">
          <Plus size={16} />
          Primeiro Registro
        </Button>
      </div>
    </div>
  );
}
