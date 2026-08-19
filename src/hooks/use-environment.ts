"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserEnvironmentRecords } from "@/lib/environment";
import type { GrowEnvironment } from "@/lib/types";

export function useEnvironment() {
  const { user } = useAuth();
  const [records, setRecords] = useState<GrowEnvironment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getUserEnvironmentRecords(user.uid);
      setRecords(data);
    } catch (err) {
      console.error("[useEnvironment]", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { records, loading, refresh: load };
}
