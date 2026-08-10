"use client";

import { useState } from "react";
import { STAGE_LABELS, STAGE_ORDER, STAGE_COLORS } from "@/lib/constants";
import { STAGE_ENV_RANGES, STAGE_RANGE_EMOJI } from "@/lib/env-ranges";
import type { GrowStage } from "@/lib/types";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageGuide {
  conditions: {
    temperature: string;
    humidity: string;
    vpd: string;
    lightSchedule: string;
    light: string;
    co2: string;
    ph: string;
  };
  tasks: string[];
  tips: string[];
  problems: { problem: string; fix: string }[];
  readyWhen: string[];
}

const GUIDE: Record<GrowStage, StageGuide> = {
  semente: {
    conditions: {
      temperature: "22–26°C",
      humidity: "65–80%",
      vpd: "0.4–0.8 kPa",
      lightSchedule: "18/6 (após emergência)",
      light: "Baixa intensidade — CFL ou LED fraca",
      co2: "Ambiente (400–800 ppm)",
      ph: "6.0–7.0 (água neutra na germinação)",
    },
    tasks: [
      "☑️ Umedecer substrato ou papel toalha",
      "☑️ Manter temperatura constante 22–26°C",
      "☑️ Verificar germinação diariamente",
      "☑️ Transplantar cuidadosamente ao ver a radícula branca",
      "☑️ Cobrir com dome ou filme plástico para manter umidade",
    ],
    tips: [
      "🌡️ A germinação é sensível a variações de temperatura — use tapete térmico se necessário",
      "💧 Não encharque — umidade excessiva afoga a radícula",
      "🌑 Germine no escuro: papel toalha úmido em prato ou copos no armário",
      "⏱️ Sementes saudáveis germinam em 24–72h",
    ],
    problems: [
      { problem: "Semente não germina após 5 dias", fix: "Escarifique levemente a casca com lixa fina e re-embeba por 12h em água levemente oxigenada" },
      { problem: "Muda tombou (damping-off)", fix: "Excesso de umidade e fungos. Reduza umidade, melhore ventilação e aplique fungicida biológico (Trichoderma)" },
      { problem: "Hipocótilo muito longo (estiolamento)", fix: "Pouca luz. Abaixe a lâmpada ou aumente a intensidade logo após emergência" },
    ],
    readyWhen: [
      "✅ Cotilédones totalmente abertos e verde-vivo",
      "✅ Primeiras folhas verdadeiras aparecendo",
      "✅ Raízes visíveis na base do torrão",
    ],
  },
  muda: {
    conditions: {
      temperature: "20–25°C",
      humidity: "60–75%",
      vpd: "0.4–0.8 kPa",
      lightSchedule: "18/6",
      light: "CFL 18W ou LED fraca 50–100 µmol — 30–40cm de distância",
      co2: "700–1000 ppm",
      ph: "5.8–6.8",
    },
    tasks: [
      "☑️ Verificar substrato diariamente — regar apenas quando seco a 2cm",
      "☑️ Introduzir ventilação suave para fortalecer caule",
      "☑️ Acompanhar abertura dos primeiros nós",
      "☑️ Iniciar nutrição fraca (EC 0.4–0.8) após 2ª semana",
      "☑️ Checar pH da água de rega (5.8–6.5)",
    ],
    tips: [
      "🌬️ Um ventilador oscilante suave fortalece o caule — sem corrente de ar direta",
      "💡 Mais horas de luz = mais crescimento; 18h/dia é padrão",
      "🚿 Regar em torno do caule (não no centro) estimula expansão radicular",
      "🧪 Inicie nutrição apenas na 2ª semana — excessos queimam raízes jovens",
    ],
    problems: [
      { problem: "Folhas amareladas / clorose", fix: "Deficiência de N ou pH incorreto. Ajuste pH para 5.8–6.5 e inicie fertilização leve" },
      { problem: "Caule fino e muda tombando", fix: "Pouca luz ou ausência de brisa. Aumente intensidade e use ventilador fraco" },
      { problem: "Manchas marrons nas folhas", fix: "Queima por fertilizante. Reduza EC pela metade e regue com água pura (flush leve)" },
    ],
    readyWhen: [
      "✅ 4–6 nós visíveis",
      "✅ Caule firme sustentando o próprio peso",
      "✅ Sistema radicular ocupando o vaso inicial",
    ],
  },
  vegetativo: {
    conditions: {
      temperature: "22–28°C",
      humidity: "50–70%",
      vpd: "0.8–1.2 kPa",
      lightSchedule: "18/6",
      light: "LED 400–600 µmol ou HPS 400W — 40–60cm de distância",
      co2: "1000–1500 ppm",
      ph: "5.8–6.8",
    },
    tasks: [
      "☑️ Aplicar LST, topping ou FIM após o 4º–5º nó",
      "☑️ Aumentar EC gradualmente: 1.2 → 2.0 mS/cm",
      "☑️ Treinar galhos laterais para dossel uniforme",
      "☑️ Regar 2–3x por semana conforme tamanho do vaso",
      "☑️ Inspecionar semanalmente para pragas e deficiências",
      "☑️ Transplante para vaso final se necessário",
    ],
    tips: [
      "✂️ Topping ao 5º nó dobra os pontos de crescimento — ideal para SOG/SCROG",
      "🧪 EC 1.2–2.0 mS/cm; mantenha N alto, P moderado, K moderado",
      "💡 18h de luz mantém o ciclo vegetativo em fotoperiódicas",
      "🌡️ Diferencial de temperatura DIF positivo (dia mais quente que noite) favorece crescimento",
    ],
    problems: [
      { problem: "Crescimento lento", fix: "Cheque temperatura (muito fria retarda), EC baixo e horas de luz insuficientes" },
      { problem: "Queima de pontas (nutrient burn)", fix: "Reduza EC em 20%, lave o substrato com água pura e aguarde recuperação" },
      { problem: "Folhas enrolando para cima (heat stress)", fix: "Aumente distância da lâmpada, melhore ventilação e reduza temperatura" },
    ],
    readyWhen: [
      "✅ Dossel uniforme, sem pontos altos isolados",
      "✅ Tamanho de 40–60% da altura final desejada",
      "✅ Pré-flores visíveis (pistílos brancos ou pólens)",
    ],
  },
  floracao: {
    conditions: {
      temperature: "20–26°C (noite 18–22°C)",
      humidity: "40–55% (reduzir para 40% nas últimas semanas)",
      vpd: "1.0–1.5 kPa",
      lightSchedule: "12/12",
      light: "LED 600–900 µmol ou HPS 600–1000W — 40–50cm",
      co2: "1200–1500 ppm",
      ph: "5.8–6.8",
    },
    tasks: [
      "☑️ Trocar para 12/12 no início",
      "☑️ Realizar lollipopping nas 2 primeiras semanas",
      "☑️ Aumentar P e K: semanas 3–6 são críticas para formação de buds",
      "☑️ Reduzir N progressivamente a partir da semana 5",
      "☑️ Monitorar tricomas com lupa a partir da semana 7",
      "☑️ Iniciar flush 1–2 semanas antes da colheita",
      "☑️ Verificar botrytis diariamente nas últimas semanas",
    ],
    tips: [
      "⚡ Reduza umidade para <50% a partir da semana 5 para prevenir mofo (botrytis)",
      "🫐 PK 13/14 ou similar nas semanas 4–6 — aumento real de buds",
      "🔍 Inspecione os cálices diariamente: botrytis pode destruir toda uma colheita em 48h",
      "🌑 48h de escuridão antes da colheita pode intensificar produção de resina",
    ],
    problems: [
      { problem: "Botrytis (mofo cinza nos buds)", fix: "Remova imediatamente o bud afetado, reduza umidade abaixo de 45% e melhore a circulação de ar" },
      { problem: "Estiramentos excessivos (foxtailing)", fix: "Temperatura muito alta na última fase. Reduza para 20–22°C e garanta noites frescas" },
      { problem: "Pistílos marrons prematuros", fix: "Pode ser stresse por calor, excesso de fertilizante ou pragas. Investigue causa raiz" },
    ],
    readyWhen: [
      "✅ 70–90% dos tricomas leitosos (pico de THC)",
      "✅ 10–30% âmbar para efeito mais sedativo/couchlock",
      "✅ Pistílos 80–90% laranja/marrom",
      "✅ Cálices inchados e buds densos",
    ],
  },
  colheita: {
    conditions: {
      temperature: "18–24°C",
      humidity: "30–45%",
      vpd: "1.2–1.6 kPa",
      lightSchedule: "Escuridão total 24–48h antes",
      light: "Sem luz durante a colheita",
      co2: "Ambiente",
      ph: "N/A — flush com água limpa",
    },
    tasks: [
      "☑️ Flush final com água pura (pH 6.0–6.5) por 7–14 dias",
      "☑️ Colher de manhã cedo (antes das luzes acenderem)",
      "☑️ Realizar wet trim ou deixar para dry trim após secagem",
      "☑️ Pesar úmido para registro",
      "☑️ Preparar área de secagem: temperatura e umidade controladas",
    ],
    tips: [
      "🔬 Use lupa 40–60x para observar tricomas — transparente=imatura, leitoso=pico THC, âmbar=degradação",
      "💧 Flush por 2 semanas antes garante sabor limpo e sem resíduo de fertilizante",
      "🌑 48h de escuridão total antes da colheita estimula produção final de resina",
      "✂️ Colha em partes se os galhos superiores estiverem prontos antes dos inferiores",
    ],
    problems: [
      { problem: "Colheu cedo (tricomas transparentes)", fix: "Não há correção — secagem rápida a 30°C pode simular maturação, mas potência será menor" },
      { problem: "Colheu tarde (tricomas totalmente âmbar)", fix: "Efeito mais sedativo/pesado. Seque a temperatura mais baixa para preservar terpenos" },
      { problem: "Cheiro fraco de grama na colheita", fix: "Normal antes da cura. A cura é essencial para desenvolvimento de terpenos" },
    ],
    readyWhen: [
      "✅ Planta seca e na câmara de secagem",
      "✅ Hastes principais quebram ao dobrar (não dobram)",
      "✅ Exterior dos buds seco mas interior ainda levemente úmido",
    ],
  },
  secagem: {
    conditions: {
      temperature: "18–22°C",
      humidity: "45–55%",
      vpd: "0.8–1.2 kPa",
      lightSchedule: "Escuro total",
      light: "Sem luz — luz degrada cannabinoids",
      co2: "Ambiente",
      ph: "N/A",
    },
    tasks: [
      "☑️ Pendurar plantas inteiras ou galhos de cabeça para baixo",
      "☑️ Manter circulação de ar suave — sem vento direto nos buds",
      "☑️ Verificar umidade 2x/dia",
      "☑️ Remover material vegetal (trim) durante secagem (dry trim)",
      "☑️ Transferir para potes de vidro ao atingir 62% UR interno",
      "☑️ Abrir potes 15 min/dia durante 2 semanas de cura",
    ],
    tips: [
      "🌡️ Secagem lenta (10–14 dias) preserva terpenos — nunca use calor > 25°C",
      "🍂 Dry trim preserva mais terpenos que wet trim — buds secam mais uniformemente",
      "📦 Cure em potes de vidro Mason com Boveda 62% para controle de umidade preciso",
      "🔄 Eructação (burping) diária nas primeiras 2 semanas é essencial para remover CO2 e gases",
    ],
    problems: [
      { problem: "Buds secaram muito rápido (< 5 dias)", fix: "Umidade muito baixa. Aumente para 50–55% e reidrate os buds com palha de laranja em pote lacrado por 24h" },
      { problem: "Mofo durante secagem", fix: "Umidade > 60% + pouco ar. Reduza umidade imediatamente e melhore a circulação. Descarte material infectado" },
      { problem: "Cheiro de feno/grama seca", fix: "Clorofila não degradou. Cure mais tempo — 4+ semanas normalmente resolve" },
    ],
    readyWhen: [
      "✅ Hastes pequenas estalam ao dobrar (não dobram)",
      "✅ Buds firmes por fora, levemente macios por dentro",
      "✅ Arôma característico da strain presente",
      "✅ Umidade interna ≈ 62% (medida com higrômetro no pote)",
    ],
  },
};

export default function GrowGuidePage() {
  const [activeStage, setActiveStage] = useState<GrowStage>("vegetativo");
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const guide = GUIDE[activeStage];
  const env = STAGE_ENV_RANGES[activeStage];

  function toggleTask(key: string) {
    setCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <MotionPage>
      <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
        <MotionItem>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={22} className="text-primary" />
              Guia de Cultivo
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Referência completa por fase</p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {STAGE_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setActiveStage(s);
                  setCheckedTasks({});
                }}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-all",
                  activeStage === s
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {STAGE_RANGE_EMOJI[s]}
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className={cn("px-4 py-3 border-b border-border", STAGE_COLORS[activeStage])}>
              <h2 className="text-sm font-semibold">
                {STAGE_RANGE_EMOJI[activeStage]} Condições Ideais — {STAGE_LABELS[activeStage]}
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "🌡️ Temperatura", value: guide.conditions.temperature },
                { label: "💧 Umidade", value: guide.conditions.humidity },
                { label: "💨 VPD", value: guide.conditions.vpd },
                { label: "💡 Ciclo de luz", value: guide.conditions.lightSchedule },
                { label: "☀️ Intensidade", value: guide.conditions.light },
                { label: "🫧 CO₂", value: guide.conditions.co2 },
                { label: "⚗️ pH", value: guide.conditions.ph },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">📋 Checklist Semanal</h2>
            </div>
            <div className="p-4 space-y-2">
              {guide.tasks.map((task, i) => {
                const key = `${activeStage}-${i}`;
                const checked = !!checkedTasks[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleTask(key)}
                    className={cn(
                      "w-full flex items-start gap-3 text-left text-sm transition-colors rounded-lg px-2 py-1.5 hover:bg-muted/20",
                      checked ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    <span className="text-base leading-tight shrink-0">{checked ? "✅" : "☐"}</span>
                    {task.replace(/^☑️\s*/, "")}
                  </button>
                );
              })}
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">💡 Dicas Pro</h2>
            </div>
            <div className="p-4 space-y-3">
              {guide.tips.map((tip, i) => (
                <p key={i} className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
              ))}
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">🔧 Problemas Comuns</h2>
            </div>
            <div className="divide-y divide-border/40">
              {guide.problems.map((prob, i) => (
                <div key={i} className="p-4 space-y-1.5">
                  <p className="text-sm font-medium text-destructive/90">⚠️ {prob.problem}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">✔️ {prob.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">🚦 Pronto para avançar quando...</h2>
            </div>
            <div className="p-4 space-y-2">
              {guide.readyWhen.map((cond, i) => (
                <p key={i} className="text-sm text-foreground/90">{cond}</p>
              ))}
            </div>
          </div>
        </MotionItem>
      </div>
    </MotionPage>
  );
}
