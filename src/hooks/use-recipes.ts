"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getRecipes } from "@/lib/recipes";
import type { NutritionRecipe } from "@/lib/recipes";

export function useRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<NutritionRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getRecipes(user.uid);
      setRecipes(data);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { recipes, loading, refresh: load };
}
