"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calculator, Leaf, Zap, Layers, GraduationCap, AlertCircle } from "lucide-react";

type Genetics = "indica" | "sativa" | "hibrida" | "autoflowering";
type Medium = "terra" | "coco" | "hidro";
type Skill = "iniciante" | "intermediario" | "avancado";

const BASE_GPW = 0.5; // grams per watt baseline

const GEN_BONUS: Record<Genetics, number> = {
  indica: 1.0,
  sativa: 0.9,
  hibrida: 1.05,
  autoflowering: 0.7,
};

const MED_BONUS: Record<Medium, number> = {
  terra: 1.0,
  coco: 1.15,
  hidro: 1.25,
};

const SKILL_BONUS: Record<Skill, number> = {
  iniciante: 0.6,
  intermediario: 0.85,
  avancado: 1.0,
};

const GEN_LABELS: Record<Genetics, string> = {
  indica: "Índica",
  sativa: "Sativa",
  hibrida: "Híbrida",
  autoflowering: "Autoflowering",
};

const MED_LABELS: Record<Medium, string> = {
  terra: "Terra",
  coco: "Coco",
  hidro: "Hidro",
};

const SKILL_LABELS: Record<Skill, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

function calcEstimate(
  watts: number,
  genetics: Genetics,
  medium: Medium,
  skill: Skill,
  floweringWeeks: number
): number {
  const weekBonus = Math.min(1.0, floweringWeeks / 9);
  return watts * BASE_GPW * GEN_BONUS[genetics] * MED_BONUS[medium] * SKILL_BONUS[skill] * weekBonus;
}

interface SelectChipProps<T extends string> {
  options: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}

function SelectChips<T extends string>({ options, value, onChange }: SelectChipProps<T>) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(Object.keys(options) as T[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            value === key
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {options[key]}
        </button>
      ))}
    </div>
  );
}

export default function YieldCalculatorPage() {
  const [watts, setWatts] = useState("400");
  const [area, setArea] = useState("1.0");
  const [genetics, setGenetics] = useState<Genetics>("hibrida");
  const [medium, setMedium] = useState<Medium>("terra");
  const [skill, setSkill] = useState<Skill>("iniciante");
  const [floweringWeeks, setFloweringWeeks] = useState(9);

  const wattsNum = parseFloat(watts);
  const areaNum  = parseFloat(area);

  const isValid =
    !isNaN(wattsNum) && wattsNum > 0 &&
    !isNaN(areaNum) && areaNum > 0 &&
    floweringWeeks >= 1 && floweringWeeks <= 16;

  const estimated = isValid ? calcEstimate(wattsNum, genetics, medium, skill, floweringWeeks) : 0;
  const low  = estimated * 0.8;
  const high = estimated * 1.2;
  const gpw  = isValid ? estimated / wattsNum : 0;
  const gpm2 = isValid && areaNum > 0 ? estimated / areaNum : 0;

  return (
    <MotionPage className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      <MotionItem>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Calculator size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Calculadora de Yield</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Estimativa de rendimento baseada nos parâmetros do seu cultivo.
            </p>
          </div>
        </div>
      </MotionItem>

      {/* Inputs */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Parâmetros do Cultivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Watts + Area */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" />
                  Potência da Luz (W)
                </Label>
                <Input
                  type="number"
                  min={1}
                  step={10}
                  value={watts}
                  onChange={(e) => setWatts(e.target.value)}
                  placeholder="400"
                  className="bg-muted/20 border-border font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Layers size={12} className="text-blue-400" />
                  Área (m²)
                </Label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="1.0"
                  className="bg-muted/20 border-border font-mono"
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Genetics */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Leaf size={12} className="text-primary" />
                Tipo Genético
              </Label>
              <SelectChips options={GEN_LABELS} value={genetics} onChange={setGenetics} />
            </div>

            <Separator className="bg-border/50" />

            {/* Medium */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Substrato</Label>
              <SelectChips options={MED_LABELS} value={medium} onChange={setMedium} />
            </div>

            <Separator className="bg-border/50" />

            {/* Skill */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <GraduationCap size={12} className="text-purple-400" />
                Habilidade do Cultivador
              </Label>
              <SelectChips options={SKILL_LABELS} value={skill} onChange={setSkill} />
            </div>

            <Separator className="bg-border/50" />

            {/* Flowering weeks */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Semanas de Floração:{" "}
                <span className="font-semibold text-foreground">{floweringWeeks} sem.</span>
              </Label>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={floweringWeeks}
                onChange={(e) => setFloweringWeeks(Number(e.target.value))}
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>1 sem.</span>
                <span>16 sem.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionItem>

      {/* Result */}
      {isValid && estimated > 0 && (
        <MotionItem>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Estimativa de Yield
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold font-mono text-primary leading-none">
                  ~{Math.round(low)}g
                </span>
                <span className="text-lg text-muted-foreground mb-0.5">–</span>
                <span className="text-4xl font-bold font-mono text-primary leading-none">
                  {Math.round(high)}g
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Média estimada: <span className="font-semibold text-foreground">{Math.round(estimated)}g</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">g/W</p>
                <p className="text-base font-bold text-foreground font-mono">{gpw.toFixed(2)}</p>
              </div>
              <div className="bg-black/20 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">g/m²</p>
                <p className="text-base font-bold text-foreground font-mono">{Math.round(gpm2)}</p>
              </div>
            </div>
          </div>
        </MotionItem>
      )}

      {/* Disclaimer */}
      <MotionItem>
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/20 border border-border">
          <AlertCircle size={14} className="text-muted-foreground/60 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            Estimativa baseada em condições ideais usando o método g/W. Resultados reais variam conforme manejo,
            genética, ambiente, nutrição e outros fatores. Use como referência, não como garantia.
          </p>
        </div>
      </MotionItem>

      {/* Bonuses breakdown */}
      <MotionItem>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fatores Aplicados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Base (g/W)", value: `${BASE_GPW}`, neutral: true },
              { label: `Genética (${GEN_LABELS[genetics]})`, value: `×${GEN_BONUS[genetics].toFixed(2)}`, boost: GEN_BONUS[genetics] >= 1 },
              { label: `Substrato (${MED_LABELS[medium]})`, value: `×${MED_BONUS[medium].toFixed(2)}`, boost: MED_BONUS[medium] >= 1 },
              { label: `Habilidade (${SKILL_LABELS[skill]})`, value: `×${SKILL_BONUS[skill].toFixed(2)}`, boost: SKILL_BONUS[skill] >= 1 },
              { label: `Floração (${floweringWeeks} sem.)`, value: `×${Math.min(1.0, floweringWeeks / 9).toFixed(2)}`, boost: floweringWeeks >= 9 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn(
                  "font-mono font-semibold",
                  row.neutral ? "text-foreground" : row.boost ? "text-primary" : "text-amber-400"
                )}>
                  {row.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </MotionItem>

    </MotionPage>
  );
}
