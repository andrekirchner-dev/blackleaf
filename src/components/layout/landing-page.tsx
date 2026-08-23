"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart3,
  Brain,
  BookOpen,
  Users,
  CalendarCheck,
  Wheat,
  ArrowRight,
  CheckCircle2,
  Leaf,
  FlaskConical,
  Camera,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BarChart3,
    title: "Painel de Cultivo",
    description:
      "Acompanhe temperatura, umidade, fase e métricas de cada planta com dashboards em tempo real.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Brain,
    title: "Diagnóstico com IA",
    description:
      "Fotografe sua planta e receba análise instantânea de doenças, deficiências e pragas por inteligência artificial.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: BookOpen,
    title: "Diário de Cultivo",
    description:
      "Registre regas, nutrição, poda e qualquer observação do grow. Histórico completo com fotos.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Users,
    title: "Comunidade",
    description:
      "Compartilhe seu cultivo, curta posts, siga cultivadores e aprenda em uma rede social exclusiva.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: CalendarCheck,
    title: "Tarefas & Lembretes",
    description:
      "Organize rotinas de cuidado com tarefas recorrentes, prioridades e notificações de vencimento.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Wheat,
    title: "Registro de Colheita",
    description:
      "Documente cada colheita com peso seco/úmido, análise de eficiência e comparativo histórico.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
];

const steps = [
  {
    number: "01",
    icon: Leaf,
    title: "Adicione suas plantas",
    description: "Cadastre cada planta com cepa, substrato, fase e iluminação. Organize por ambiente.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Monitore e documente",
    description: "Registre eventos diários, tire fotos, anote nutrição e analise com IA em segundos.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Evolua com dados",
    description: "Acompanhe gráficos, compare colheitas e compartilhe resultados com a comunidade.",
  },
];

const stats = [
  { value: "6", label: "Fases de cultivo" },
  { value: "IA", label: "Diagnóstico inteligente" },
  { value: "∞", label: "Registros no diário" },
  { value: "24/7", label: "Monitoramento ativo" },
];

const tools = [
  { icon: FlaskConical, label: "Calculadora de Nutrição" },
  { icon: Brain, label: "Análise de Folhas por IA" },
  { icon: Wheat, label: "Estimativa de Produção" },
  { icon: BarChart3, label: "Histórico de Ambiente" },
  { icon: ShieldCheck, label: "Dados privados e seguros" },
  { icon: Zap, label: "Sincronização em tempo real" },
];

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-3.5 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain mix-blend-screen" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">
            <span className="gradient-text">Black</span>
            <span className="text-accent">leaf</span>
          </span>
        </div>
        <Link href="/login">
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-4"
          >
            Entrar
            <ArrowRight size={13} />
          </Button>
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 text-center">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-primary/6 blur-[140px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[120px]"
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.8 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8 0 0) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
          {/* Logo + badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.14, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/25 blur-2xl"
              />
              <div className="relative w-28 h-28">
                <Image
                  src="/logo-icon.png"
                  alt="Blackleaf"
                  fill
                  className="object-contain mix-blend-screen drop-shadow-[0_0_40px_rgba(34,197,94,0.35)]"
                  priority
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Beta · Acesso Exclusivo
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-3"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              <span className="gradient-text">Monitore</span> seu cultivo{" "}
              <br className="hidden sm:block" />
              com{" "}
              <span className="text-accent">inteligência</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Blackleaf é o app completo para cultivadores de cannabis — controle de plantas, diagnóstico com IA, diário de cultivo e uma comunidade exclusiva.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-3 items-center"
          >
            <Link href="/login">
              <Button className="gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-7 text-sm shadow-[0_4px_30px_rgba(34,197,94,0.2)]">
                Começar agora
                <ArrowRight size={15} />
              </Button>
            </Link>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              Ver funcionalidades
              <ArrowRight size={13} className="opacity-50" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-6 sm:gap-10 justify-center pt-2"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-accent">{s.value}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest text-center">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-border to-transparent"
        />
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-5 py-20 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <span className="text-[11px] text-primary uppercase tracking-[0.3em] font-semibold">Funcionalidades</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
            Tudo que você precisa para{" "}
            <span className="gradient-text">cultivar bem</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Ferramentas profissionais pensadas para quem leva o cultivo a sério.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className={`h-full rounded-2xl border ${f.border} bg-card/60 p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors group`}>
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <Icon size={18} className={f.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 py-20 bg-card/30 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-semibold">Como funciona</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
              Três passos para o <span className="text-accent">cultivo perfeito</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.number} delay={i * 0.12} className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tools row ── */}
      <section className="px-5 py-16 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-10">
          <span className="text-[11px] text-primary uppercase tracking-[0.3em] font-semibold">Ferramentas extras</span>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold">
            Muito mais além do básico
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <FadeIn key={t.label} delay={i * 0.07}>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card/40 hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground/80">{t.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ── Community preview ── */}
      <section className="px-5 py-20 bg-card/30 border-y border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-semibold">Comunidade</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
              Cultive junto com <span className="text-accent">outros growers</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Compartilhe fotos do seu grow, receba likes e comentários, siga cultivadores e descubra técnicas novas em uma rede social exclusiva para o universo cannabis.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { emoji: "📸", title: "Compartilhe fotos", desc: "Posts com dados do cultivo: substrato, iluminação, semana do grow." },
              { emoji: "❤️", title: "Curta e comente", desc: "Interaja com outros cultivadores e receba feedback da comunidade." },
              { emoji: "🌿", title: "Siga cultivadores", desc: "Acompanhe os grows que te inspiram e construa sua rede." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col gap-2"
              >
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative px-5 py-24 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]"
          />
        </div>

        <FadeIn className="relative z-10 flex flex-col items-center gap-7 max-w-md">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 size={36} className="text-primary" />
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Pronto para começar?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Acesse gratuitamente com sua conta Google. Seus dados ficam privados e seguros na nuvem.
            </p>
          </div>

          <Link href="/login">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="gap-2.5 bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 px-8 text-sm shadow-[0_4px_30px_rgba(251,191,36,0.2)]">
                Criar conta
                <ArrowRight size={15} />
              </Button>
            </motion.div>
          </Link>

          <p className="text-[11px] text-muted-foreground/50">
            Sem cartão de crédito · Dados privados · Sync na nuvem
          </p>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain mix-blend-screen" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase">
            <span className="gradient-text">Black</span>
            <span className="text-accent">leaf</span>
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/50 text-center">
          Tecnologia · Cannabis · Exclusividade
        </p>
        <Link href="/login" className="text-[11px] text-primary hover:underline">
          Entrar no app →
        </Link>
      </footer>
    </div>
  );
}
