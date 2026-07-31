"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subscribeSeeds, type SeedEntry } from "@/lib/seeds";

export function useSeeds() {
  const { user } = useAuth();
  const [seeds, setSeeds] = useState<SeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSeeds([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeSeeds(user.uid, (data) => {
      setSeeds(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { seeds, loading };
}
