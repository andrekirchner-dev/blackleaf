"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart3, Brain, BookOpen, Users, CalendarCheck, Wheat,
  ArrowRight, CheckCircle2, Leaf, FlaskConical, Camera,
  TrendingUp, ShieldCheck, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: BarChart3,
    title: "Painel de Cultivo",
    description: "Acompanhe temperatura, umidade, fase e métricas de cada planta com dashboards em tempo real.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(34,197,94,0.15)] hover:border-primary/40",
  },
  {
    icon: Brain,
    title: "Diagnóstico com IA",
    description: "Fotografe sua planta e receba análise instantânea de doenças, deficiências e pragas por inteligência artificial.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(234,179,8,0.12)] hover:border-accent/40",
  },
  {
    icon: BookOpen,
    title: "Diário de Cultivo",
    description: "Registre regas, nutrição, poda e qualquer observação do grow. Histórico completo com fotos.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(34,197,94,0.15)] hover:border-primary/40",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Compartilhe seu cultivo, curta posts, siga cultivadores e aprenda em uma rede social exclusiva.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(234,179,8,0.12)] hover:border-accent/40",
  },
  {
    icon: CalendarCheck,
    title: "Tarefas & Lembretes",
    description: "Organize rotinas de cuidado com tarefas recorrentes, prioridades e notificações de vencimento.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(34,197,94,0.15)] hover:border-primary/40",
  },
  {
    icon: Wheat,
    title: "Registro de Colheita",
    description: "Documente cada colheita com peso seco/úmido, análise de eficiência e comparativo histórico.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    glow: "hover:shadow-[0_0_28px_-4px_rgba(234,179,8,0.12)] hover:border-accent/40",
  },
];

const steps = [
  { icon: Leaf,       title: "Adicione suas plantas",   description: "Cadastre cepa, substrato, fase e iluminação. Organize por ambiente." },
  { icon: Camera,     title: "Monitore e documente",    description: "Registre eventos diários, tire fotos e analise com IA em segundos." },
  { icon: TrendingUp, title: "Evolua com dados",        description: "Acompanhe gráficos, compare colheitas e compartilhe na comunidade." },
];

const stats = [
  { value: "6",    label: "Fases de cultivo" },
  { value: "IA",   label: "Diagnóstico inteligente" },
  { value: "∞",    label: "Registros no diário" },
  { value: "24/7", label: "Monitoramento ativo" },
];

const tools = [
  { icon: FlaskConical, label: "Calculadora de Nutrição" },
  { icon: Brain,        label: "Análise de Folhas por IA" },
  { icon: Wheat,        label: "Estimativa de Produção" },
  { icon: BarChart3,    label: "Histórico de Ambiente" },
  { icon: ShieldCheck,  label: "Dados privados e seguros" },
  { icon: Zap,          label: "Sincronização em tempo real" },
];

const communityCards = [
  { emoji: "📸", title: "Compartilhe fotos",  desc: "Posts com dados do cultivo: substrato, iluminação e semana do grow.", bg: "from-primary/15 to-transparent" },
  { emoji: "❤️", title: "Curta e comente",    desc: "Interaja com outros cultivadores e receba feedback da comunidade.",  bg: "from-accent/12 to-transparent" },
  { emoji: "🌿", title: "Siga cultivadores",  desc: "Acompanhe os grows que te inspiram e construa a sua rede.",          bg: "from-primary/15 to-transparent" },
];

// ─────────────────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-55px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between bg-card/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl px-4 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7" style={{ mixBlendMode: "screen" }}>
              <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" />
            </div>
            <span className="text-[13px] font-extrabold tracking-[0.15em] uppercase">
              <span className="gradient-text">Black</span>
              <span className="text-accent">leaf</span>
            </span>
          </div>
          <Link href="/login">
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs h-8 px-4 rounded-xl">
              Entrar <ArrowRight size={11} />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-28 pb-16 text-center">
        {/* BG */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-primary/7 blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[130px]"
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(oklch(0.8 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8 0 0) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.16, 1], opacity: [0.18, 0.42, 0.18] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-8 rounded-full bg-primary/18 blur-3xl pointer-events-none"
              />
              <div className="relative w-28 h-28" style={{ mixBlendMode: "screen" }}>
                <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" priority />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/22 text-primary text-[11px] font-bold tracking-[0.22em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Beta · Acesso Exclusivo
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <h1 className="text-5xl sm:text-6xl font-black tracking-[-0.02em] leading-[1.06]">
              <span className="gradient-text">Monitore</span> seu cultivo<br />
              com <span className="text-accent">inteligência</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Blackleaf é o app completo para cultivadores de cannabis — controle de plantas, diagnóstico com IA, diário de cultivo e comunidade exclusiva.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 items-center"
          >
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 px-8 text-sm rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.22)]">
                  Começar agora
                  <ArrowRight size={14} />
                </Button>
              </motion.div>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-12 px-4"
            >
              Ver funcionalidades
              <ArrowRight size={12} className="opacity-40" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex gap-8 sm:gap-12 justify-center pt-2"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-accent">{s.value}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 uppercase tracking-widest text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-border/60 to-transparent"
        />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-5 py-24 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-14">
          <span className="text-[11px] text-primary uppercase tracking-[0.3em] font-bold">Funcionalidades</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
            Tudo que você precisa para{" "}
            <span className="gradient-text">cultivar bem</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ferramentas profissionais pensadas para quem leva o cultivo a sério.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.title} delay={i * 0.07}>
                <div className={cn(
                  "group h-full rounded-2xl border bg-card/50 p-5 flex flex-col gap-4 transition-all duration-300",
                  f.border, f.glow
                )}>
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", f.bg)}>
                    <Icon size={20} className={f.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-24 border-y border-border/30" style={{ background: "oklch(0.095 0.003 142 / 0.4)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold">Como funciona</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Três passos para o <span className="text-accent">cultivo perfeito</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-[28px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.title} delay={i * 0.13} className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-card border border-primary/25 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.08)]">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-foreground">{s.title}</h3>
                    <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed max-w-[190px] mx-auto">{s.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className="px-5 py-20 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-10">
          <span className="text-[11px] text-primary uppercase tracking-[0.3em] font-bold">Ferramentas extras</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
            Muito mais além do básico
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <FadeIn key={t.label} delay={i * 0.06}>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/70 transition-all duration-200 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <span className="text-[13px] font-medium text-foreground/75 group-hover:text-foreground transition-colors">{t.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="px-5 py-24 border-y border-border/30" style={{ background: "oklch(0.095 0.003 142 / 0.4)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold">Comunidade</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Cultive junto com <span className="text-accent">outros growers</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Compartilhe fotos do seu grow, receba likes e comentários, siga cultivadores e descubra técnicas novas em uma rede social exclusiva para o universo cannabis.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {communityCards.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden hover:border-border transition-colors">
                  <div className={cn("h-2 bg-gradient-to-r", c.bg)} />
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <h3 className="font-bold text-[15px] text-foreground">{c.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-5 py-28 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/7 blur-[130px]"
          />
        </div>

        <FadeIn className="relative z-10 flex flex-col items-center gap-7 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.12)]">
            <CheckCircle2 size={28} className="text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Pronto para começar?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Acesse gratuitamente com sua conta Google. Seus dados ficam privados e seguros na nuvem.
            </p>
          </div>
          <Link href="/login">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button className="gap-2.5 bg-accent text-accent-foreground hover:bg-accent/90 font-black h-12 px-9 text-sm rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.22)]">
                Criar conta
                <ArrowRight size={15} />
              </Button>
            </motion.div>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[12px] text-muted-foreground/50">
            {["Sem cartão de crédito", "Dados privados", "Sync na nuvem"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-primary/40" /> {t}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30 px-5 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5" style={{ mixBlendMode: "screen" }}>
              <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" />
            </div>
            <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase">
              <span className="gradient-text">Black</span>
              <span className="text-accent">leaf</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/40 text-center">Tecnologia · Cannabis · Exclusividade</p>
          <Link href="/login" className="text-[11px] text-primary/60 hover:text-primary transition-colors">
            Entrar no app →
          </Link>
        </div>
      </footer>
    </div>
  );
}
