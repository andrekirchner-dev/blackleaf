"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserEntries } from "@/lib/diary";
import type { DiaryEntry } from "@/lib/types";

export function useDiary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getUserEntries(user.uid);
      setEntries(data);
    } catch (err) {
      console.error("[useDiary]", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { entries, loading, refresh: load };
}
