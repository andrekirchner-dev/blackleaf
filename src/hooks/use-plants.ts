"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserPlants } from "@/lib/plants";
import type { Plant } from "@/lib/types";

export function usePlants() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserPlants(user.uid);
      setPlants(data.filter((p) => !p.archived));
    } catch (err) {
      console.error("[usePlants]", err);
      setError("Erro ao carregar plantas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { plants, loading, error, refresh: load };
}
