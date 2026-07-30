"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserSpaces } from "@/lib/spaces";
import type { GrowSpace } from "@/lib/types";

export function useSpaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<GrowSpace[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserSpaces(user.uid);
      setSpaces(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { spaces, loading, refresh: load };
}
