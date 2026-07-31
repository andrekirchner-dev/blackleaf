"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  subscribeShoppingItems,
  type ShoppingItem,
} from "@/lib/shopping";

export function useShopping() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeShoppingItems(user.uid, (data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { items, loading };
}
