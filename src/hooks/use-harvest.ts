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
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getUserHarvests(user.uid);
      setHarvests(data);
    } catch (err) {
      console.error("[useHarvest]", err);
      setHarvests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { harvests, loading, refresh: load };
}
