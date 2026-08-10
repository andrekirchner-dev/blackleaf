"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

function friendlyError(code?: string): string {
  switch (code) {
    case "auth/popup-blocked":
      return "Popup bloqueado pelo navegador. Libere popups para este site e tente novamente.";
    case "auth/network-request-failed":
      return "Erro de rede. Verifique sua conexão e tente novamente.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado. Entre em contato com o suporte.";
    case "auth/internal-error":
      return "Erro interno. Tente novamente em alguns instantes.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    default:
      return "Erro ao fazer login. Tente novamente.";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result after mobile sign-in flow returns
    getRedirectResult(auth).catch((err: unknown) => {
      const code = (err as { code?: string }).code;
      if (code && code !== "auth/null-user") {
        setAuthError(friendlyError(code));
        setSigningIn(false);
      }
    });

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
      const isMobile =
        typeof navigator !== "undefined" &&
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        // Redirect flow — page navigates away, result handled in useEffect above
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setSigningIn(false);
        return;
      }
      setAuthError(friendlyError(code));
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

