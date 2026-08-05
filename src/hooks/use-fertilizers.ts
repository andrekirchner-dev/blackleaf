"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserFertilizers } from "@/lib/fertilizers";
import type { Fertilizer } from "@/lib/types";

export function useFertilizers() {
  const { user } = useAuth();
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserFertilizers(user.uid);
      setFertilizers(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { fertilizers, loading, refresh: load };
}
