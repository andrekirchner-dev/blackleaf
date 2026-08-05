"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Zap, Plus, Trash2, TrendingUp, BatteryCharging } from "lucide-react";

type Equipment = {
  id: string;
  name: string;
  watts: string;
  hoursPerDay: string;
};

function makeEquipment(name: string, watts: string, hours: string): Equipment {
  return { id: crypto.randomUUID(), name, watts, hoursPerDay: hours };
}

const DEFAULT_EQUIPMENT: Equipment[] = [
  makeEquipment("Luminária LED", "600", "18"),
  makeEquipment("Extração / Exaustor", "120", "24"),
  makeEquipment("Circulador de Ar", "45", "24"),
];

function fmt(value: number, decimals = 2): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function EnergyPage() {
  const [items, setItems] = useState<Equipment[]>(DEFAULT_EQUIPMENT);
  const [tariff, setTariff] = useState<string>("0.85");
  const [cultivoDuration, setCultivoDuration] = useState<string>("12");

  const tariffNum = parseFloat(tariff) || 0;
  const cultivoWeeks = parseFloat(cultivoDuration) || 0;

  const addItem = () => {
    setItems((prev) => [...prev, makeEquipment("Novo Equipamento", "100", "12")]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof Equipment, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  // Computed values per equipment
  const computed = items.map((item) => {
    const w = parseFloat(item.watts) || 0;
    const h = parseFloat(item.hoursPerDay) || 0;
    const dailyKwh = (w * h) / 1000;
    return { ...item, w, h, dailyKwh };
  });

  const totalDailyKwh = computed.reduce((s, i) => s + i.dailyKwh, 0);
  const totalWeeklyKwh = totalDailyKwh * 7;
  const totalMonthlyKwh = totalDailyKwh * 30;
  const totalCultivoKwh = totalDailyKwh * 7 * cultivoWeeks;

  const costDaily = totalDailyKwh * tariffNum;
  const costWeekly = totalWeeklyKwh * tariffNum;
  const costMonthly = totalMonthlyKwh * tariffNum;
  const costCultivo = totalCultivoKwh * tariffNum;

  const biggestConsumer =
    computed.length > 0
      ? computed.reduce((max, i) => (i.dailyKwh > max.dailyKwh ? i : max), computed[0])
      : null;

  const biggestPct =
    biggestConsumer && totalDailyKwh > 0
      ? (biggestConsumer.dailyKwh / totalDailyKwh) * 100
      : 0;

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Custo de Energia</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Calcule o consumo elétrico e custo total do seu setup de cultivo.
            </p>
          </div>
        </div>
      </MotionItem>

      {/* Tariff + Duration */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tarifa (R$/kWh)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={tariff}
                  onChange={(e) => setTariff(e.target.value)}
                  className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <p className="text-[10px] text-muted-foreground">Padrão: R$ 0,85</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Duração do Cultivo (semanas)</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={cultivoDuration}
                  onChange={(e) => setCultivoDuration(e.target.value)}
                  className="bg-muted/20 border-border text-foreground text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <p className="text-[10px] text-muted-foreground">Ex: 16 semanas (veg + flora)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {/* Equipment list */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Equipamentos</CardTitle>
              <Button
                onClick={addItem}
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-[11px] text-primary hover:bg-primary/10 gap-1"
              >
                <Plus size={12} />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <Separator className="bg-border/40 mb-3" />}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Nome do equipamento"
                      className="bg-muted/20 border-border text-foreground text-sm flex-1"
                    />
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Watts (W)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={item.watts}
                        onChange={(e) => updateItem(item.id, "watts", e.target.value)}
                        className="bg-muted/20 border-border text-foreground text-center font-mono text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Horas/dia</Label>
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={item.hoursPerDay}
                        onChange={(e) => updateItem(item.id, "hoursPerDay", e.target.value)}
                        className="bg-muted/20 border-border text-foreground text-center font-mono text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  {/* Per-item daily consumption */}
                  {(() => {
                    const c = computed.find((c) => c.id === item.id);
                    return c && c.dailyKwh > 0 ? (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <BatteryCharging size={10} className="text-primary" />
                        <span>{fmt(c.dailyKwh, 3)} kWh/dia</span>
                        {totalDailyKwh > 0 && (
                          <span className="ml-auto text-primary font-medium">
                            {((c.dailyKwh / totalDailyKwh) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhum equipamento. Clique em "Adicionar" para começar.
              </p>
            )}
          </CardContent>
        </Card>
      </MotionItem>

      {/* Results */}
      {totalDailyKwh > 0 && (
        <MotionItem>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                Resumo de Consumo e Custo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Diário", kwh: totalDailyKwh, cost: costDaily },
                  { label: "Semanal", kwh: totalWeeklyKwh, cost: costWeekly },
                  { label: "Mensal", kwh: totalMonthlyKwh, cost: costMonthly },
                  { label: `Cultivo (${cultivoWeeks}sem)`, kwh: totalCultivoKwh, cost: costCultivo },
                ].map((row) => (
                  <div key={row.label} className="bg-muted/15 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{row.label}</p>
                    <p className="text-lg font-bold font-mono text-primary leading-none">{fmtCurrency(row.cost)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{fmt(row.kwh, 2)} kWh</p>
                  </div>
                ))}
              </div>

              {biggestConsumer && totalDailyKwh > 0 && (
                <>
                  <Separator className="bg-border/50" />
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Maior Consumidor
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{biggestConsumer.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {fmt(biggestConsumer.dailyKwh, 3)} kWh/dia
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-amber-400 font-mono">{biggestPct.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">do total</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${biggestPct}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </MotionItem>
      )}
    </MotionPage>
  );
}
