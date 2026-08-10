"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
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
      return "Popup bloqueado. Tentando método alternativo...";
    case "auth/network-request-failed":
      return "Erro de rede. Verifique sua conexão e tente novamente.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase. Contate o administrador.";
    case "auth/internal-error":
      return "Erro interno. Tente novamente em alguns instantes.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    default:
      return "Erro ao fazer login. Tente novamente.";
  }
}

const REDIRECT_FLAG_KEY = "bl_redirect_pending";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Track whether getRedirectResult has finished so we don't prematurely
  // mark loading=false when onAuthStateChanged fires null first.
  const redirectChecked = useRef(false);
  const pendingAuthUser = useRef<User | null | "not-set">("not-set");

  useEffect(() => {
    const wasRedirectPending = sessionStorage.getItem(REDIRECT_FLAG_KEY) === "1";

    // Handle any redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err: unknown) => {
        const code = (err as { code?: string }).code;
        if (code && code !== "auth/null-user") {
          setAuthError(friendlyError(code));
          setSigningIn(false);
        }
      })
      .finally(() => {
        sessionStorage.removeItem(REDIRECT_FLAG_KEY);
        redirectChecked.current = true;

        // If onAuthStateChanged already fired, apply it now
        if (pendingAuthUser.current !== "not-set") {
          setUser(pendingAuthUser.current);
          setLoading(false);
          setSigningIn(false);
        }
      });

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!redirectChecked.current && wasRedirectPending) {
        // Redirect result not yet processed — defer loading=false
        pendingAuthUser.current = u;
        return;
      }
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
      // Prefer popup for all devices — works on iOS when triggered by user gesture.
      // Avoids redirect flow issues (third-party cookie blocking, race conditions).
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;

      // User closed the popup intentionally — not an error
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setSigningIn(false);
        return;
      }

      // Popup was blocked by the browser — fall back to redirect
      if (code === "auth/popup-blocked") {
        try {
          sessionStorage.setItem(REDIRECT_FLAG_KEY, "1");
          await signInWithRedirect(auth, googleProvider);
          return; // Page navigates away, no need to reset signingIn
        } catch (redirectErr: unknown) {
          sessionStorage.removeItem(REDIRECT_FLAG_KEY);
          const redirectCode = (redirectErr as { code?: string }).code;
          setAuthError(friendlyError(redirectCode));
          setSigningIn(false);
          return;
        }
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
