"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserHarvests } from "@/lib/harvest";
import type { HarvestLog } from "@/lib/types";

export function useHarvest() {
  const { user } = useAuth();
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserHarvests(user.uid);
      setHarvests(data);
    } catch {
      setHarvests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { harvests, loading, refresh: load };
}
