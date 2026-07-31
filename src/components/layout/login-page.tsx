"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const statItems = [
  { label: "Fases", value: "6" },
  { label: "Métricas", value: "∞" },
  { label: "Diário", value: "24/7" },
];

export function LoginPage() {
  const { signInWithGoogle, signingIn, authError } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.15 180 / 0.3), transparent)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.8 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8 0 0) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            {/* Pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            />
            <div className="relative w-36 h-36 animate-float">
              <Image
                src="/logo-icon.png"
                alt="Blackleaf Logo"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-4xl font-bold tracking-[0.15em] uppercase">
              <span className="gradient-text">Black</span>
              <span className="text-accent">leaf</span>
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-[0.3em] uppercase">
              Tecnologia&nbsp;•&nbsp;Cannabis&nbsp;•&nbsp;Exclusividade
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex gap-8 text-center"
        >
          {statItems.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
              className="flex flex-col gap-1"
            >
              <span className="text-2xl font-bold text-accent">{s.value}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35, type: "spring", stiffness: 200, damping: 24 }}
          className="w-full max-w-sm bg-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/60"
        >
          <div className="flex justify-center mb-5">
            <div className="relative w-48 h-12">
              <Image src="/logo-full.png" alt="Blackleaf" fill className="object-contain" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Acesse seu painel de cultivo com sua conta Google.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={signInWithGoogle}
              disabled={signingIn}
              className="w-full gap-3 font-semibold h-12 text-sm bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-70 shadow-[0_4px_24px_rgba(251,191,36,0.15)]"
            >
              {signingIn ? (
                <div className="w-4 h-4 rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {signingIn ? "Redirecionando..." : "Entrar com Google"}
            </Button>
          </motion.div>
          {authError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2"
            >
              {authError}
            </motion.p>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground/50"
        >
          Dados privados e sincronizados com segurança.
        </motion.p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
