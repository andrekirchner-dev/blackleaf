"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result after Google redirects back
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
        setAuthError(friendlyError(err.code));
      });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      setAuthError(friendlyError(code));
      setSigningIn(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signingIn, authError, signInWithGoogle, logout }}>
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
      return "Popup bloqueado pelo navegador. Tente novamente ou libere popups.";
    case "auth/popup-closed-by-user":
      return "Login cancelado.";
    case "auth/network-request-failed":
      return "Erro de rede. Verifique sua conexão.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase. Verifique as configurações.";
    case "auth/cancelled-popup-request":
      return "";
    default:
      return code ? `Erro: ${code}` : "Erro ao fazer login. Tente novamente.";
  }
}
