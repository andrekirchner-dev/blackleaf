"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setSigningIn(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const message = (err as { message?: string }).message;
      console.error("[Blackleaf Auth]", { code, message, err });
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setSigningIn(false);
        return;
      }
      // Show raw code/message so we can diagnose
      setAuthError(code ? `Erro: ${code}` : `Erro: ${message ?? "desconhecido"}`);
      setSigningIn(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signingIn, authError, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function friendlyError(code?: string): string {
  switch (code) {
    case "auth/popup-blocked":
      return "Popup bloqueado pelo navegador. Libere popups para este site e tente novamente.";
    case "auth/network-request-failed":
      return "Erro de rede. Verifique sua conexão.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase. Verifique as configurações.";
    case "auth/internal-error":
      return "Erro interno. Tente novamente em alguns instantes.";
    default:
      return code ? `Erro: ${code}` : "Erro ao fazer login. Tente novamente.";
  }
}
