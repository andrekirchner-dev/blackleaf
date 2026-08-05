"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserPreferences, saveDashboardLayout } from "@/lib/user-preferences";
import { DEFAULT_LAYOUT, WIDGET_REGISTRY, type WidgetId } from "@/lib/dashboard-widgets";

export function useDashboardLayout() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.uid)
      .then((prefs) => {
        if (prefs.dashboardLayout && prefs.dashboardLayout.length > 0) {
          // Only use what the user explicitly saved — new widgets start disabled
          const saved = prefs.dashboardLayout.filter((id) =>
            WIDGET_REGISTRY.some((w) => w.id === id)
          );
          setLayout(saved);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const saveLayout = useCallback(
    async (newLayout: WidgetId[]) => {
      if (!user) return;
      setLayout(newLayout);
      await saveDashboardLayout(user.uid, newLayout);
    },
    [user]
  );

  return { layout, saveLayout, loading };
}
