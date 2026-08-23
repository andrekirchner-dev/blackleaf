"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart3, Brain, BookOpen, Users, CalendarCheck, Wheat,
  ArrowRight, Leaf, Camera, TrendingUp, Heart, MessageCircle,
  CheckCircle2, FlaskConical, ShieldCheck, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Shared animation ──────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Mock app UI cards ────────────────────────────────────────────────────────

function PlantCard() {
  return (
    <div className="w-52 bg-card/95 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4 shadow-2xl shadow-black/70">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-base">🌿</div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold truncate text-foreground">Amnesia Haze #1</p>
          <p className="text-[9px] text-muted-foreground">Semana 6 · Floração</p>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {[
          { l: "Temperatura", v: "24°C", c: "text-primary" },
          { l: "Umidade", v: "65%", c: "text-accent" },
          { l: "VPD", v: "1.2 kPa", c: "text-primary" },
          { l: "DLI", v: "40.5", c: "text-accent" },
        ].map((m) => (
          <div key={m.l} className="bg-muted/40 rounded-xl p-2 text-center">
            <p className={cn("text-[11px] font-bold", m.c)}>{m.v}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{m.l}</p>
          </div>
        ))}
      </div>
      <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ delay: 1.2, duration: 1.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
        />
      </div>
      <p className="text-[8px] text-muted-foreground mt-1">Progresso · 75%</p>
    </div>
  );
}

function AICard() {
  return (
    <div className="w-44 bg-card/95 backdrop-blur-sm border border-primary/20 rounded-2xl p-3.5 shadow-2xl shadow-black/70">
      <div className="flex items-center gap-1.5 mb-3">
        <Brain size={11} className="text-primary" />
        <span className="text-[10px] font-bold text-primary tracking-wide">DIAGNÓSTICO IA</span>
      </div>
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 mb-2.5">
        <p className="text-[10px] font-semibold text-foreground mb-1.5">Def. de Magnésio</p>
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ delay: 1.4, duration: 1.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-[9px] font-bold text-primary">94%</span>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground leading-relaxed">
        Aplicar CalMag 2ml/L por 3 dias consecutivos.
      </p>
    </div>
  );
}

function CommunityCard() {
  return (
    <div className="w-40 bg-card/95 backdrop-blur-sm border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/70">
      <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/8 to-transparent flex items-center justify-center">
        <span className="text-3xl">🌿</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-[7px] font-black text-accent">G</span>
          </div>
          <span className="text-[9px] text-muted-foreground">grower_420</span>
        </div>
        <p className="text-[9px] font-semibold text-foreground mb-2 leading-tight">Semana 7 chegando forte! 🔥</p>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            <Heart size={9} className="text-red-400 fill-red-400" />
            <span className="text-[8px] text-muted-foreground">247</span>
          </div>
          <div className="flex items-center gap-0.5">
            <MessageCircle size={9} className="text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">18</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature bento items ──────────────────────────────────────────────────────

const bentoFeatures = [
  {
    icon: BarChart3,
    tag: "Dashboard",
    title: "Painel de cultivo em tempo real",
    description: "Temperatura, umidade, VPD e DLI — monitore cada planta e ambiente com gráficos detalhados.",
    size: "lg:col-span-2",
    accent: "primary" as const,
    visual: "chart",
  },
  {
    icon: Brain,
    tag: "IA",
    title: "Diagnóstico inteligente",
    description: "Fotografe sua planta e receba análise de doenças, pragas e deficiências em segundos.",
    size: "",
    accent: "accent" as const,
    visual: "bar",
  },
  {
    icon: BookOpen,
    tag: "Diário",
    title: "Registro completo de cada fase",
    description: "Rega, poda, nutrição, observações — tudo documentado com fotos e organizado por data.",
    size: "",
    accent: "primary" as const,
  },
  {
    icon: Users,
    tag: "Comunidade",
    title: "Rede social exclusiva",
    description: "Compartilhe grows, curta posts e siga cultivadores em uma comunidade feita para o universo cannabis.",
    size: "",
    accent: "accent" as const,
  },
  {
    icon: CalendarCheck,
    tag: "Tarefas",
    title: "Lembretes e rotinas recorrentes",
    description: "Crie tarefas programadas com prioridades para nunca esquecer uma rega ou aplicação.",
    size: "lg:col-span-2",
    accent: "primary" as const,
  },
  {
    icon: Wheat,
    tag: "Colheita",
    title: "Histórico e análise de produção",
    description: "Peso seco, eficiência por watt e comparativo entre ciclos — evolua a cada harvest.",
    size: "",
    accent: "accent" as const,
  },
];

const extraTools = [
  { icon: FlaskConical, label: "Calculadora de nutrição" },
  { icon: Brain, label: "Análise de folhas por IA" },
  { icon: Wheat, label: "Estimativa de produção" },
  { icon: BarChart3, label: "Histórico ambiental" },
  { icon: ShieldCheck, label: "Dados privados e seguros" },
  { icon: Zap, label: "Sincronização em tempo real" },
];

// ── Main export ───────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <nav className="max-w-4xl mx-auto flex items-center justify-between bg-card/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6" style={{ mixBlendMode: "screen" }}>
              <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" />
            </div>
            <span className="text-[13px] font-extrabold tracking-[0.15em] uppercase">
              <span className="gradient-text">Black</span>
              <span className="text-accent">leaf</span>
            </span>
          </div>
          <Link href="/login">
            <Button
              size="sm"
              className="h-8 px-4 gap-1.5 bg-primary/90 text-primary-foreground hover:bg-primary text-xs font-bold rounded-xl border border-primary/30"
            >
              Entrar <ArrowRight size={11} />
            </Button>
          </Link>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-32 pb-16 overflow-hidden">
        {/* BG effects */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,rgba(34,197,94,0.09),transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0 0) 1px,transparent 1px),linear-gradient(90deg,oklch(0.7 0 0) 1px,transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[130px]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-7 max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-[11px] font-bold tracking-[0.25em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Beta · Acesso Exclusivo
            </span>
          </motion.div>

          {/* H1 */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black tracking-[-0.02em] leading-[1.06]">
              <span className="gradient-text">Cultive</span> com<br />
              tecnologia e{" "}
              <span className="text-accent">inteligência.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Blackleaf reúne monitoramento de plantas, diagnóstico por IA, diário de cultivo e
              comunidade em um único app — para quem leva o grow a sério.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Link href="/login">
              <Button className="h-12 px-7 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.18)]">
                Criar conta
                <ArrowRight size={14} />
              </Button>
            </Link>
            <a
              href="#features"
              className="h-12 px-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/70 rounded-xl transition-colors"
            >
              Ver funcionalidades
            </a>
          </motion.div>

          {/* Floating mock cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative w-full flex justify-center items-end gap-3 mt-4 pb-4"
            style={{ height: 220 }}
          >
            <motion.div
              className="self-start mt-6"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <PlantCard />
            </motion.div>
            <motion.div
              className="self-end mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <AICard />
            </motion.div>
            <motion.div
              className="self-start mt-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <CommunityCard />
            </motion.div>
            {/* Fade bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="border-y border-border/25 bg-white/[0.012]">
        <div className="max-w-3xl mx-auto px-5 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { v: "6", l: "Fases de crescimento" },
            { v: "IA", l: "Diagnóstico inteligente" },
            { v: "∞", l: "Registros no diário" },
            { v: "24/7", l: "Monitoramento ativo" },
          ].map((s, i) => (
            <FadeUp key={s.l} delay={i * 0.07} className="flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-accent">{s.v}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 uppercase tracking-widest mt-1.5 leading-tight">{s.l}</span>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* ── BENTO FEATURES ── */}
      <section id="features" className="px-5 py-24 max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <span className="text-[11px] text-primary uppercase tracking-[0.3em] font-bold">Funcionalidades</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Tudo que você precisa.<br />
            <span className="gradient-text">Nada que você não usa.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bentoFeatures.map((f, i) => {
            const Icon = f.icon;
            const green = f.accent === "primary";
            return (
              <FadeUp key={f.title} delay={i * 0.06} className={f.size}>
                <div
                  className={cn(
                    "group h-full rounded-2xl border p-5 flex flex-col gap-3.5 transition-all duration-300 cursor-default",
                    "bg-[oklch(0.095_0.004_142)]",
                    green
                      ? "border-border/35 hover:border-primary/35 hover:shadow-[0_0_40px_-4px_rgba(34,197,94,0.08)]"
                      : "border-border/35 hover:border-accent/35 hover:shadow-[0_0_40px_-4px_rgba(234,179,8,0.06)]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        green ? "bg-primary/10" : "bg-accent/10"
                      )}
                    >
                      <Icon size={17} className={green ? "text-primary" : "text-accent"} />
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-[0.2em]",
                          green ? "text-primary/60" : "text-accent/60"
                        )}
                      >
                        {f.tag}
                      </span>
                      <h3 className="text-sm font-bold text-foreground leading-snug mt-0.5">{f.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>

                  {/* Visual decorations */}
                  {f.visual === "chart" && (
                    <div className="flex items-end gap-1.5 h-10 mt-1">
                      {[55, 70, 45, 80, 65, 90, 75].map((h, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: idx * 0.07, ease: "easeOut" }}
                          className="flex-1 bg-primary/25 rounded-sm group-hover:bg-primary/35 transition-colors"
                        />
                      ))}
                    </div>
                  )}
                  {f.visual === "bar" && (
                    <div className="space-y-1.5 mt-1">
                      {[
                        { l: "Def. Magnésio", v: 94 },
                        { l: "Manchas foliares", v: 32 },
                      ].map((r) => (
                        <div key={r.l} className="space-y-0.5">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-muted-foreground">{r.l}</span>
                            <span className="font-bold text-accent">{r.v}%</span>
                          </div>
                          <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${r.v}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className={r.v > 50 ? "h-full bg-primary rounded-full" : "h-full bg-accent/50 rounded-full"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Tools row */}
        <FadeUp delay={0.1} className="mt-10">
          <p className="text-center text-[11px] text-muted-foreground/50 uppercase tracking-widest mb-4">E muito mais</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {extraTools.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/30 bg-white/[0.02] text-xs text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                >
                  <Icon size={12} className="text-primary/60" />
                  {t.label}
                </div>
              );
            })}
          </div>
        </FadeUp>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-24 border-y border-border/20 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold">Como funciona</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Simples de usar.<br />
              <span className="text-accent">Poderoso nos resultados.</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-[26px] left-[calc(16.5%+20px)] right-[calc(16.5%+20px)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {[
              { icon: Leaf, title: "Cadastre suas plantas", desc: "Adicione cepa, substrato, fase e iluminação. Organize por ambiente." },
              { icon: Camera, title: "Monitore e documente", desc: "Registre eventos diários, analise com IA e acompanhe métricas em tempo real." },
              { icon: TrendingUp, title: "Evolua com dados", desc: "Compare colheitas, veja gráficos de evolução e compartilhe na comunidade." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeUp key={s.title} delay={i * 0.15} className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-[oklch(0.095_0.004_142)] border border-primary/20 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.08)]">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[9px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-[180px] mx-auto">{s.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY TEASER ── */}
      <section className="px-5 py-24 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-border/30 bg-[oklch(0.095_0.004_142)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: text */}
            <div className="p-8 sm:p-12 flex flex-col justify-center gap-6">
              <FadeUp>
                <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold">Comunidade</span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Cultive junto com<br />
                  <span className="text-accent">outros growers.</span>
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  Compartilhe fotos do seu grow, receba likes e comentários, siga cultivadores e descubra técnicas novas em uma rede social exclusiva.
                </p>
              </FadeUp>
              <FadeUp delay={0.1} className="flex flex-col gap-2.5">
                {[
                  { emoji: "📸", text: "Posts com dados reais do cultivo" },
                  { emoji: "❤️", text: "Likes, comentários e seguidores" },
                  { emoji: "🌿", text: "Acompanhe grows que te inspiram" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </FadeUp>
              <FadeUp delay={0.2}>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="gap-2 border-border/50 hover:border-accent/50 hover:text-accent text-sm font-semibold rounded-xl w-fit"
                  >
                    Entrar na comunidade
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </FadeUp>
            </div>

            {/* Right: mock posts grid */}
            <FadeUp delay={0.15} className="relative border-t lg:border-t-0 lg:border-l border-border/20 p-6 sm:p-8 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/3 pointer-events-none" />
              <div className="relative grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { emoji: "🌿", user: "leaf_br", likes: 247, text: "Semana 7 🔥", bg: "from-primary/20 to-primary/5" },
                  { emoji: "🪴", user: "grow_dev", likes: 189, text: "Top da floração", bg: "from-accent/15 to-accent/3" },
                  { emoji: "🌱", user: "cultivo_sp", likes: 312, text: "Dia 45 ✨", bg: "from-primary/15 to-primary/3" },
                  { emoji: "☘️", user: "grower99", likes: 421, text: "Novo ciclo!", bg: "from-accent/20 to-accent/5" },
                ].map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.45 }}
                    className="bg-card/80 border border-white/[0.06] rounded-2xl overflow-hidden"
                  >
                    <div className={cn("h-14 bg-gradient-to-br flex items-center justify-center", p.bg)}>
                      <span className="text-2xl">{p.emoji}</span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[9px] font-semibold text-foreground mb-1 truncate">{p.text}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-muted-foreground">@{p.user}</span>
                        <div className="flex items-center gap-0.5">
                          <Heart size={7} className="text-red-400 fill-red-400" />
                          <span className="text-[8px] text-muted-foreground">{p.likes}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative px-5 py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_110%,rgba(34,197,94,0.08),transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0 0) 1px,transparent 1px),linear-gradient(90deg,oklch(0.7 0 0) 1px,transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        <FadeUp className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center gap-7">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <CheckCircle2 size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Pronto para cultivar<br />
              <span className="gradient-text">com inteligência?</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Acesse gratuitamente com sua conta Google. Seus dados são privados e protegidos na nuvem.
            </p>
          </div>
          <Link href="/login">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button className="h-12 px-9 gap-2.5 bg-accent text-accent-foreground hover:bg-accent/90 font-black text-base rounded-xl shadow-[0_0_50px_rgba(234,179,8,0.22)]">
                Criar conta
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          </Link>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs text-muted-foreground/50">
            {["Sem cartão de crédito", "Dados 100% privados", "Sync em tempo real"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={10} className="text-primary/40" />
                {t}
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/20 px-5 py-5">
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
          <p className="text-[10px] text-muted-foreground/35">Tecnologia · Cannabis · Exclusividade</p>
          <Link href="/login" className="text-[11px] text-primary/60 hover:text-primary transition-colors">
            Entrar no app →
          </Link>
        </div>
      </footer>
    </div>
  );
}
