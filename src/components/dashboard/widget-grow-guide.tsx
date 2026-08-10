"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/constants";
import type { Plant, GrowStage } from "@/lib/types";

interface Props {
  plants: Plant[];
}

const STAGE_TIPS: Record<GrowStage, string[]> = {
  semente: [
    "🌡️ Mantenha 22–26°C e umidade >70% para melhor taxa de germinação",
    "💧 Não encharque — umedeça o substrato levemente, não encharque",
    "🌑 Germine no escuro dentro de papel úmido ou diretamente no substrato",
  ],
  muda: [
    "☀️ 18h de luz suave (CFL ou LED com baixa intensidade) para mudas",
    "🚿 Regar apenas quando o substrato estiver seco a 2cm de profundidade",
    "🌬️ Ventilação suave fortalece os caules — use um ventilador oscilante",
  ],
  vegetativo: [
    "✂️ Aplique LST ou topping após o 4º nó para maximizar produção",
    "🧪 Aumente EC gradualmente: 1.2–2.0 mS/cm durante o veg",
    "💡 18/6 é o ciclo ideal — mais luz = mais crescimento vegetativo",
  ],
  floracao: [
    "⚡ Troque para 12/12 e reduza umidade a 40–55% para prevenir botrytis",
    "🫐 Aumente P e K nas semanas 3–6 para maximizar desenvolvimento dos buds",
    "🔍 Inspecione diariamente para sinais de pragas ou doenças",
  ],
  colheita: [
    "🔬 Observe tricomas com lupa 40x — âmbar = máximo THC/efeito",
    "💧 Flush por 1–2 semanas antes da colheita para limpar os nutrientes",
    "🌑 48h de escuridão antes da colheita pode aumentar produção de resina",
  ],
  secagem: [
    "🌡️ Seque a 18–22°C com 45–55% de umidade para secagem lenta e ideal",
    "🍂 Não use calor direto — seque devagar por 7–14 dias para melhor aroma",
    "📦 Cure em potes de vidro, abrindo diariamente por 2 semanas",
  ],
};

export function WidgetGrowGuide({ plants }: Props) {
  const active = plants.filter((p) => !p.archived);

  const criticalPlant = active.length > 0
    ? active.reduce((prev, curr) => {
        const prevIdx = STAGE_ORDER.indexOf(prev.stage);
        const currIdx = STAGE_ORDER.indexOf(curr.stage);
        return currIdx < prevIdx ? curr : prev;
      })
    : null;

  const tips = criticalPlant ? STAGE_TIPS[criticalPlant.stage] : [];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen size={14} className="text-primary" />
          Guia de Cultivo
        </h3>
        <Link href="/tools/grow-guide" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Ver guia →
        </Link>
      </div>

      {!criticalPlant ? (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma planta ativa</p>
          <Link href="/plants/new" className="text-xs text-primary mt-1 block hover:underline">
            Adicionar planta →
          </Link>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Dicas para {STAGE_LABELS[criticalPlant.stage]} · {criticalPlant.name}
          </p>
          {tips.map((tip, i) => (
            <p key={i} className="text-xs text-foreground/80 leading-relaxed">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
