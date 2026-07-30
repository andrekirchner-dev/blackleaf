"use client";

import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DiaryPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diário de Cultivo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registre regas, nutrições e observações</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} />
          Novo Registro
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <BookOpen size={28} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Diário vazio</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Comece a registrar regas, nutrições e observações das suas plantas.
          </p>
        </div>
        <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus size={16} />
          Primeiro Registro
        </Button>
      </div>
    </div>
  );
}
