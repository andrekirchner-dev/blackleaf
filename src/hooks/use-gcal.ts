"use client";

import { useState, useEffect, useCallback } from "react";

export function useGCal() {
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect back from OAuth before checking status
    const params = new URLSearchParams(window.location.search);
    if (params.get("gcal_connected")) {
      setIsConnected(true);
      setChecking(false);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (params.get("gcal_error")) {
      setError(`Erro ao conectar: ${params.get("gcal_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetch("/api/auth/google/status")
      .then((r) => r.json())
      .then((d) => { setIsConnected(d.connected); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  const connect = useCallback(() => {
    setConnecting(true);
    window.location.href = "/api/auth/google";
  }, []);

  const disconnect = useCallback(async () => {
    await fetch("/api/auth/google/disconnect", { method: "POST" });
    setIsConnected(false);
  }, []);

  const clearIfExpired = useCallback(async () => {
    const res = await fetch("/api/auth/google/status");
    const data = await res.json();
    if (!data.connected) {
      setIsConnected(false);
      return true;
    }
    return false;
  }, []);

  return { isConnected, connect, disconnect, connecting: connecting || checking, error, clearIfExpired };
}
