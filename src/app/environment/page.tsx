"use client";

import { Thermometer, Droplets, Wind, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EnvironmentPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ambiente</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitore temperatura, umidade e CO₂</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} />
          Registrar Ambiente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Temperatura", icon: Thermometer, color: "text-orange-400", bg: "bg-orange-400/10", unit: "°C", ideal: "20–28°C" },
          { label: "Umidade", icon: Droplets, color: "text-blue-400", bg: "bg-blue-400/10", unit: "%", ideal: "40–70%" },
          { label: "CO₂", icon: Wind, color: "text-green-400", bg: "bg-green-400/10", unit: "ppm", ideal: "700–1500 ppm" },
        ].map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md ${m.bg} flex items-center justify-center`}>
                  <m.icon size={14} className={m.color} />
                </div>
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-1">Ideal: {m.ideal}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center">
          <Thermometer size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">Nenhum registro de ambiente</p>
          <p className="text-xs text-muted-foreground mt-1">Registre os dados do seu ambiente para acompanhar as condições ideais.</p>
        </CardContent>
      </Card>
    </div>
  );
}
