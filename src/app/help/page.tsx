"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  LayoutGrid, Leaf, BookOpen, Thermometer, Brain, Users,
  CalendarCheck, Trophy, Bug, Stethoscope, Microscope,
  Wind, Sun, Zap, Droplets, Calculator, ShoppingCart,
  Plus, Camera, CheckCircle2, ChevronRight, Lightbulb,
  Star, Sprout, FlaskConical, Bell, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </span>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/15 rounded-xl px-4 py-3 mt-4">
      <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
      <p className="text-[12px] text-accent/80 leading-relaxed">{text}</p>
    </div>
  );
}

function SectionCard({
  id, icon: Icon, color, title, description, steps, tip, children,
}: {
  id: string;
  icon: React.ElementType;
  color: "primary" | "accent";
  title: string;
  description: string;
  steps: string[];
  tip?: string;
  children?: React.ReactNode;
}) {
  const green = color === "primary";
  return (
    <FadeIn>
      <section id={id} className="scroll-mt-6">
        <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-3 px-5 py-4 border-b border-border/30",
            green ? "bg-primary/5" : "bg-accent/5"
          )}>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              green ? "bg-primary/15" : "bg-accent/15"
            )}>
              <Icon size={18} className={green ? "text-primary" : "text-accent"} />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-foreground">{title}</h2>
              <p className="text-[12px] text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Steps */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Como usar</p>
              {steps.map((s, i) => <Step key={i} n={i + 1} text={s} />)}
              {tip && <Tip text={tip} />}
            </div>

            {/* Visual / mock */}
            <div className="flex items-center justify-center">
              {children}
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

// ── Mock UI previews ──────────────────────────────────────────────────────────

function MockPlantCard() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm">🌿</div>
        <div>
          <p className="text-[12px] font-bold">Amnesia Haze #1</p>
          <p className="text-[10px] text-muted-foreground">Floração · Semana 6</p>
        </div>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { l: "Substrato", v: "Terra" },
          { l: "Luz", v: "LED 480W" },
          { l: "Início", v: "15/01/25" },
          { l: "Ambiente", v: "Tent #1" },
        ].map(m => (
          <div key={m.l} className="bg-muted/30 rounded-lg p-2">
            <p className="text-[9px] text-muted-foreground">{m.l}</p>
            <p className="text-[11px] font-semibold">{m.v}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 bg-primary/8 rounded-lg px-3 py-1.5">
        <CheckCircle2 size={11} className="text-primary" />
        <span className="text-[10px] text-primary font-medium">Planta saudável</span>
      </div>
    </div>
  );
}

function MockDiaryEntry() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">23 ago 2025</span>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">Rega</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Droplets size={11} className="text-primary" />
          <span className="text-[11px]">Volume: <strong>2L</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FlaskConical size={11} className="text-accent" />
          <span className="text-[11px]">pH: <strong>6.2</strong> · EC: <strong>1.4</strong></span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-2">
        "Folhas com aspecto excelente. Flores começando a encorpar."
      </p>
      <div className="h-14 bg-muted/30 rounded-xl flex items-center justify-center">
        <Camera size={16} className="text-muted-foreground/40" />
      </div>
    </div>
  );
}

function MockEnvCard() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Thermometer size={13} className="text-primary" />
        <span className="text-[12px] font-bold">Tent #1</span>
        <span className="ml-auto text-[10px] text-muted-foreground">agora</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: "Temperatura", v: "24.5°C", c: "text-primary" },
          { l: "Umidade", v: "62%", c: "text-accent" },
          { l: "VPD", v: "1.18 kPa", c: "text-primary" },
          { l: "CO₂", v: "800 ppm", c: "text-accent" },
        ].map(m => (
          <div key={m.l} className="bg-muted/30 rounded-xl p-2 text-center">
            <p className={cn("text-[13px] font-black", m.c)}>{m.v}</p>
            <p className="text-[9px] text-muted-foreground">{m.l}</p>
          </div>
        ))}
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/40 rounded-full" />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">7 registros hoje</p>
    </div>
  );
}

function MockAICard() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-3">
      <div className="h-24 bg-gradient-to-br from-primary/15 to-transparent rounded-xl flex items-center justify-center">
        <Camera size={28} className="text-primary/40" />
      </div>
      <div className="flex items-center gap-2">
        <Brain size={13} className="text-primary" />
        <span className="text-[11px] font-bold text-primary">Diagnóstico IA</span>
        <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">94%</span>
      </div>
      <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
        <p className="text-[11px] font-semibold">Deficiência de Magnésio</p>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[94%] bg-primary rounded-full" />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Recomendação: CalMag 2ml/L por 3 dias.
      </p>
    </div>
  );
}

function MockCommunityCard() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl overflow-hidden shadow-lg">
      <div className="h-28 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
        <span className="text-4xl">🌿</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-black text-accent">G</div>
          <span className="text-[11px] text-muted-foreground">@grower_br</span>
        </div>
        <p className="text-[12px] font-semibold">Semana 7 chegando forte! 🔥</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[9px]">Terra</span>
          <span className="bg-muted/40 px-1.5 py-0.5 rounded-full text-[9px]">LED</span>
          <span className="bg-muted/40 px-1.5 py-0.5 rounded-full text-[9px]">Sem. 7</span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Heart size={10} className="text-red-400 fill-red-400" /> 247
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTaskCard() {
  return (
    <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-2.5">
      <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Tarefas de hoje</p>
      {[
        { done: true,  text: "Regar Tent #1",         tag: "🔁 Diário" },
        { done: false, text: "Aplicar CalMag",          tag: "⚡ Alta" },
        { done: false, text: "Registrar ambiente",       tag: "🔁 Diário" },
        { done: true,  text: "Verificar pH da solução", tag: "📅 Hoje" },
      ].map((t, i) => (
        <div key={i} className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl border",
          t.done ? "border-border/30 bg-muted/10 opacity-50" : "border-border/50 bg-card"
        )}>
          <div className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
            t.done ? "border-primary bg-primary" : "border-muted-foreground/40"
          )}>
            {t.done && <CheckCircle2 size={9} className="text-primary-foreground" />}
          </div>
          <span className={cn("text-[11px] flex-1", t.done && "line-through")}>{t.text}</span>
          <span className="text-[9px] text-muted-foreground shrink-0">{t.tag}</span>
        </div>
      ))}
    </div>
  );
}

// ── Quick nav cards ───────────────────────────────────────────────────────────

const quickNav = [
  { id: "espacos",    icon: LayoutGrid,  label: "Espaços",       color: "primary" as const },
  { id: "plantas",    icon: Leaf,        label: "Plantas",        color: "accent"  as const },
  { id: "diario",     icon: BookOpen,    label: "Diário",         color: "primary" as const },
  { id: "ambiente",   icon: Thermometer, label: "Ambiente",       color: "accent"  as const },
  { id: "ia",         icon: Brain,       label: "IA & Diagnóstico", color: "primary" as const },
  { id: "comunidade", icon: Users,       label: "Comunidade",     color: "accent"  as const },
  { id: "tarefas",    icon: CalendarCheck, label: "Tarefas",      color: "primary" as const },
  { id: "colheita",   icon: Trophy,      label: "Colheitas",      color: "accent"  as const },
  { id: "ferramentas", icon: Calculator, label: "Ferramentas",    color: "primary" as const },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/40 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Star size={18} className="text-accent" />
            Guia do Blackleaf
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Aprenda a usar cada funcionalidade de forma prática e rápida.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Quick nav */}
        <FadeIn>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {quickNav.map((n) => {
              const Icon = n.icon;
              const green = n.color === "primary";
              return (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all hover:scale-105",
                    green
                      ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                      : "border-accent/20 bg-accent/5 hover:bg-accent/10"
                  )}
                >
                  <Icon size={16} className={green ? "text-primary" : "text-accent"} />
                  <span className="text-[10px] font-semibold leading-tight text-foreground/70">{n.label}</span>
                </a>
              );
            })}
          </div>
        </FadeIn>

        {/* ── PRIMEIROS PASSOS ── */}
        <FadeIn>
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-transparent p-5">
            <div className="flex items-center gap-3 mb-4">
              <Sprout size={20} className="text-primary" />
              <h2 className="font-black text-lg">Por onde começar?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { n: 1, icon: LayoutGrid, title: "Crie um Espaço", desc: "Espaços representam seus ambientes de cultivo (tent, quarto, estufa). Vá em Espaços → + Novo Espaço.", href: "/spaces" },
                { n: 2, icon: Leaf,       title: "Adicione uma Planta", desc: "Com o espaço criado, vá em Plantas → + Nova Planta e preencha cepa, substrato e fase inicial.", href: "/plants/new" },
                { n: 3, icon: BookOpen,   title: "Comece o Diário", desc: "Registre seu primeiro evento no Diário — rega, nutrição ou simplesmente uma observação com foto.", href: "/diary" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.n} href={s.href} className="group block rounded-xl border border-border/50 bg-card/60 p-4 hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center">{s.n}</span>
                      <Icon size={14} className="text-primary" />
                      <span className="text-[12px] font-bold">{s.title}</span>
                      <ChevronRight size={12} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* ── ESPAÇOS ── */}
        <SectionCard
          id="espacos"
          icon={LayoutGrid}
          color="primary"
          title="Espaços"
          description="Organize seus ambientes de cultivo"
          steps={[
            "Acesse Espaços no menu lateral.",
            "Toque em + Novo Espaço e dê um nome (ex: Tent 80x80, Quarto de Vegetação).",
            "Adicione dimensões e tipo de ambiente para cálculos automáticos de DLI e VPD.",
            "Cada espaço agrupa plantas e registros de ambiente separadamente.",
          ]}
          tip="Crie um espaço por ambiente físico — isso mantém as métricas de temperatura e umidade organizadas por local."
        >
          <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Meus Espaços</p>
            {[
              { name: "Tent #1 · 80×80", plants: 2, temp: "24°C", active: true },
              { name: "Tent #2 · 120×60", plants: 3, temp: "23°C", active: false },
            ].map(s => (
              <div key={s.name} className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border",
                s.active ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card"
              )}>
                <LayoutGrid size={13} className={s.active ? "text-primary" : "text-muted-foreground"} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{s.name}</p>
                  <p className="text-[9px] text-muted-foreground">{s.plants} plantas · {s.temp}</p>
                </div>
                {s.active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-border/50 text-[11px] text-muted-foreground hover:border-primary/30 transition-colors">
              <Plus size={12} /> Novo Espaço
            </button>
          </div>
        </SectionCard>

        {/* ── PLANTAS ── */}
        <SectionCard
          id="plantas"
          icon={Leaf}
          color="accent"
          title="Plantas"
          description="Cadastro e acompanhamento de cada planta"
          steps={[
            "Vá em Plantas → toque em + Nova Planta.",
            "Preencha nome, cepa, substrato, tipo de luz e selecione o espaço.",
            "Defina a fase inicial: Semente, Muda, Vegetação ou Floração.",
            "Acesse o cartão da planta para ver todas as informações e o histórico do diário.",
            "Toque em Editar para atualizar a fase conforme a planta cresce.",
          ]}
          tip="Adicione a data de germinação para que o app calcule automaticamente a semana do cultivo em posts da comunidade."
        >
          <MockPlantCard />
        </SectionCard>

        {/* ── DIÁRIO ── */}
        <SectionCard
          id="diario"
          icon={BookOpen}
          color="primary"
          title="Diário de Cultivo"
          description="Registre cada evento do seu grow"
          steps={[
            "Acesse Diário no menu lateral.",
            "Toque em + Novo Registro e escolha o tipo de evento.",
            "Tipos disponíveis: Rega, Nutrição, Poda, Transplante, Observação, Foto.",
            "Adicione notas, fotos, pH e EC para registros de rega/nutrição.",
            "Para editar um registro, toque nele e selecione Editar.",
          ]}
          tip="Registre pelo menos uma vez por dia. Com o histórico completo você vai identificar padrões e melhorar a cada ciclo."
        >
          <MockDiaryEntry />
        </SectionCard>

        {/* ── AMBIENTE ── */}
        <SectionCard
          id="ambiente"
          icon={Thermometer}
          color="accent"
          title="Monitoramento de Ambiente"
          description="Registre temperatura, umidade e outros dados"
          steps={[
            "Acesse Ambiente no menu lateral.",
            "Selecione o espaço e toque em + Registrar Ambiente.",
            "Insira temperatura, umidade relativa, CO₂ e outros dados disponíveis.",
            "O app calcula VPD automaticamente a partir de temperatura e umidade.",
            "O gráfico de histórico mostra os últimos 7 dias de dados por espaço.",
          ]}
          tip="Registre ambiente manhã e noite para capturar variações entre período de luz e escuro — essencial na floração."
        >
          <MockEnvCard />
        </SectionCard>

        {/* ── IA ── */}
        <SectionCard
          id="ia"
          icon={Brain}
          color="primary"
          title="Diagnóstico com IA"
          description="Identifique problemas com uma foto"
          steps={[
            "Acesse Ferramentas no menu → escolha Diagnóstico de Doenças, Identificação de Pragas ou Diagnóstico Nutricional.",
            "Toque na área de foto para abrir a câmera ou galeria.",
            "Selecione ou tire uma foto clara da folha ou área afetada.",
            "A IA analisa a imagem e retorna as causas mais prováveis com percentual de confiança.",
            "Siga as recomendações exibidas para tratar o problema.",
          ]}
          tip="Para melhores resultados, fotografe em luz natural ou sob a luz do tent (desligando o filtro). Foque na folha afetada de perto, garantindo nitidez."
        >
          <MockAICard />
        </SectionCard>

        {/* ── COMUNIDADE ── */}
        <SectionCard
          id="comunidade"
          icon={Users}
          color="accent"
          title="Comunidade"
          description="Compartilhe seu grow e interaja com outros cultivadores"
          steps={[
            "Acesse Comunidade no menu lateral.",
            "Toque em + Publicar para criar um post com foto.",
            "Adicione legenda, selecione as plantas da foto, substrato e iluminação.",
            "Curta posts com ❤️ e deixe comentários clicando no balão.",
            "Acesse o perfil de um cultivador e toque em Seguir para acompanhar o grow dele.",
            "O sino no menu mostra notificações de curtidas, comentários e novos seguidores.",
          ]}
          tip="Posts com dados completos (substrato, luz, semana) têm mais engajamento. Compartilhe tanto os bons momentos quanto os desafios — a comunidade aprende junto."
        >
          <MockCommunityCard />
        </SectionCard>

        {/* ── TAREFAS ── */}
        <SectionCard
          id="tarefas"
          icon={CalendarCheck}
          color="primary"
          title="Tarefas & Lembretes"
          description="Organize rotinas e nunca esqueça uma rega"
          steps={[
            "Acesse Calendário no menu lateral para ver tarefas e eventos.",
            "Toque em + Nova Tarefa para criar um lembrete.",
            "Defina título, data, prioridade (baixa/média/alta) e recorrência.",
            "Recorrências disponíveis: diária, dias específicos, semanal, quinzenal ou mensal.",
            "Tarefas vencidas aparecem destacadas. Marque como concluída tocando no círculo.",
            "Tarefas recorrentes geram automaticamente a próxima ocorrência ao serem concluídas.",
          ]}
          tip="Crie tarefas recorrentes para rega, monitoramento de pH e aplicação de nutrientes. Isso garante consistência no cultivo sem depender da memória."
        >
          <MockTaskCard />
        </SectionCard>

        {/* ── COLHEITA ── */}
        <SectionCard
          id="colheita"
          icon={Trophy}
          color="accent"
          title="Registro de Colheitas"
          description="Documente e compare cada harvest"
          steps={[
            "Acesse Colheitas no menu lateral.",
            "Toque em + Nova Colheita e selecione a planta colhida.",
            "Insira peso úmido, peso seco, data e notas de qualidade.",
            "O app calcula automaticamente eficiência (g/W) e perda na cura.",
            "O gráfico comparativo mostra a evolução entre todos os ciclos.",
          ]}
          tip="Anote também informações sobre a cura — tempo, umidade do jar, e avaliação final. Esses dados são ouro para melhorar o próximo ciclo."
        >
          <div className="w-full max-w-[240px] bg-background border border-border rounded-2xl p-4 shadow-lg space-y-3">
            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Última Colheita</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Amnesia Haze #1</span>
                <span className="font-bold text-accent">✓ Colhida</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { l: "Peso úmido", v: "340g", c: "text-foreground" },
                  { l: "Peso seco", v: "68g", c: "text-primary" },
                  { l: "Eficiência", v: "0.48g/W", c: "text-accent" },
                  { l: "Perda na cura", v: "80%", c: "text-foreground" },
                ].map(m => (
                  <div key={m.l} className="bg-muted/30 rounded-xl p-2 text-center">
                    <p className={cn("text-[12px] font-black", m.c)}>{m.v}</p>
                    <p className="text-[9px] text-muted-foreground">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-accent/8 border border-accent/15 rounded-lg px-3 py-1.5">
              <Trophy size={11} className="text-accent" />
              <span className="text-[10px] text-accent font-semibold">Ciclo de 84 dias</span>
            </div>
          </div>
        </SectionCard>

        {/* ── FERRAMENTAS ── */}
        <FadeIn>
          <section id="ferramentas" className="scroll-mt-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30 bg-primary/5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Calculator size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-[15px]">Ferramentas Extras</h2>
                  <p className="text-[12px] text-muted-foreground">Calculadoras e guias especializados</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Bug,         label: "Identificação de Pragas",    desc: "Foto → IA identifica o tipo de praga e recomenda tratamento.",                href: "/tools/pests" },
                  { icon: Stethoscope, label: "Diagnóstico de Doenças",     desc: "Detecta fungos, vírus e outros problemas a partir de fotos.",                 href: "/tools/diseases" },
                  { icon: Microscope,  label: "Diagnóstico Nutricional",    desc: "Analisa sintomas visuais de deficiências e toxicidades.",                      href: "/tools/nutrients" },
                  { icon: Wind,        label: "Calculadora VPD",            desc: "Insira temperatura e umidade para calcular o VPD ideal.",                      href: "/tools/vpd" },
                  { icon: Sun,         label: "Calculadora DLI",            desc: "Calcule o índice de luz diário a partir do PPFD e horas de luz.",              href: "/tools/dli" },
                  { icon: Zap,         label: "Custo de Energia",           desc: "Estime o consumo e custo elétrico mensal do seu setup.",                       href: "/tools/energy" },
                  { icon: Droplets,    label: "Flush & Colheita",           desc: "Guia de flushagem e indicadores para o momento ideal de colheita.",            href: "/tools/flush" },
                  { icon: Calculator,  label: "Calculadora de Yield",       desc: "Estime produção esperada com base em watts, substrato e habilidade.",          href: "/tools/yield-calculator" },
                  { icon: ShoppingCart, label: "Lista de Compras",          desc: "Adicione insumos à lista e marque como comprado quando chegar.",               href: "/shopping" },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <Link key={t.href} href={t.href} className="group flex items-start gap-3 px-4 py-3 rounded-xl border border-border/40 bg-background hover:border-primary/30 hover:bg-primary/3 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold">{t.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t.desc}</p>
                      </div>
                      <ChevronRight size={13} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ── DICAS FINAIS ── */}
        <FadeIn>
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-accent" />
              <h2 className="font-black text-[16px]">Dicas de ouro</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Registre no diário logo após regar ou tratar — o hábito diário torna o app muito mais poderoso.",
                "Use os espaços para separar ambientes com condições diferentes (veg. e flora, por exemplo).",
                "Tire fotos frequentes. O histórico visual é o recurso mais valioso para identificar o que funcionou.",
                "Nas ferramentas de IA, quanto mais nítida e iluminada a foto, mais preciso o diagnóstico.",
                "Siga cultivadores da comunidade — você aprenderá técnicas que não estão em nenhum manual.",
                "Configure tarefas recorrentes de rega logo no início. Consistência é a chave para um bom cultivo.",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Bottom CTA */}
        <FadeIn className="text-center py-4">
          <p className="text-[13px] text-muted-foreground">
            Alguma dúvida? Pergunte para a{" "}
            <Link href="/community" className="text-primary hover:underline font-semibold">
              Comunidade Blackleaf
            </Link>
            .
          </p>
        </FadeIn>

      </div>
    </div>
  );
}
