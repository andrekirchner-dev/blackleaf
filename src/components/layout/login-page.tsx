"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg shadow-primary/10">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M22 4C22 4 8 12 8 24C8 31.732 14.268 38 22 38C29.732 38 36 31.732 36 24C36 12 22 4 22 4Z"
                fill="oklch(0.65 0.19 142)"
                fillOpacity="0.9"
              />
              <path
                d="M22 14C22 14 14 19 14 26C14 30.418 17.582 34 22 34C26.418 34 30 30.418 30 26C30 19 22 14 22 14Z"
                fill="oklch(0.45 0.14 142)"
              />
              <line x1="22" y1="28" x2="22" y2="40" stroke="oklch(0.65 0.19 142)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Black<span className="text-primary">leaf</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 tracking-widest uppercase">
              Grow Monitor
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="max-w-sm">
          <p className="text-muted-foreground text-base leading-relaxed">
            Monitore suas plantas, registre seu cultivo e acompanhe cada fase do crescimento com precisão.
          </p>
        </div>

        {/* Stats preview */}
        <div className="flex gap-6 text-center">
          {[
            { label: "Fases", value: "6" },
            { label: "Métricas", value: "∞" },
            { label: "Diário", value: "24/7" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-primary">{s.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Login card */}
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/40">
          <h2 className="text-xl font-semibold mb-2">Entrar no cultivo</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Use sua conta Google para acessar seu painel.
          </p>
          <Button
            onClick={signInWithGoogle}
            className="w-full gap-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Seus dados são privados e sincronizados com segurança.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
