"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserEvents } from "@/lib/events";
import type { GrowEvent } from "@/lib/types";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<GrowEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserEvents(user.uid);
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { events, loading, refresh: load };
}
