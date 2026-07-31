"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserGrowStyles, GROW_STYLE_PRESETS } from "@/lib/grow-styles";
import type { GrowStyle } from "@/lib/types";

export function useGrowStyles() {
  const { user } = useAuth();
  const [custom, setCustom] = useState<GrowStyle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserGrowStyles(user.uid);
      setCustom(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return {
    styles: [...GROW_STYLE_PRESETS, ...custom],
    presets: GROW_STYLE_PRESETS,
    custom,
    loading,
    refresh: load,
  };
}
