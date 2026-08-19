"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getTasks } from "@/lib/grow-tasks";
import type { GrowTask } from "@/lib/grow-tasks";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<GrowTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getTasks(user.uid);
      setTasks(data);
    } catch (err) {
      console.error("[useTasks]", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { tasks, loading, refresh: load };
}
