"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getCosts } from "@/lib/costs";
import type { GrowCost } from "@/lib/costs";

export function useCosts() {
  const { user } = useAuth();
  const [costs, setCosts] = useState<GrowCost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCosts(user.uid);
      setCosts(data);
    } catch {
      setCosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { costs, loading, refresh: load };
}
