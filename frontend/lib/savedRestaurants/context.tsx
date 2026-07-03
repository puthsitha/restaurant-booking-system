"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { listSavedRestaurants, saveRestaurant, unsaveRestaurant } from "@/lib/savedRestaurants/api";

interface SavedRestaurantsContextValue {
  savedIds: Set<string>;
  toggle: (restaurantId: string) => Promise<void>;
}

const SavedRestaurantsContext = createContext<SavedRestaurantsContextValue | null>(null);

// Loads the signed-in diner's saved-restaurant ids once and exposes a toggle
// so any `RestaurantCard` on the page can show/flip its heart without each
// caller threading the list through props.
export function SavedRestaurantsProvider({ children }: { children: ReactNode }) {
  const { token, status } = useCustomerAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status !== "authenticated" || !token) {
      setSavedIds(new Set());
      return;
    }
    listSavedRestaurants(token)
      .then((res) => setSavedIds(new Set(res.savedRestaurants.map((s) => s.restaurant.id))))
      .catch(() => {
        // Non-critical — the heart just won't reflect saved state this load.
      });
  }, [token, status]);

  const toggle = useCallback(
    async (restaurantId: string) => {
      if (!token) return;
      const isSaved = savedIds.has(restaurantId);
      // Optimistic update so the heart responds instantly.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(restaurantId);
        else next.add(restaurantId);
        return next;
      });
      try {
        if (isSaved) await unsaveRestaurant(restaurantId, token);
        else await saveRestaurant(restaurantId, token);
      } catch {
        // Revert on failure.
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(restaurantId);
          else next.delete(restaurantId);
          return next;
        });
      }
    },
    [token, savedIds],
  );

  const value = useMemo<SavedRestaurantsContextValue>(() => ({ savedIds, toggle }), [savedIds, toggle]);

  return <SavedRestaurantsContext.Provider value={value}>{children}</SavedRestaurantsContext.Provider>;
}

export function useSavedRestaurants(): SavedRestaurantsContextValue {
  const ctx = useContext(SavedRestaurantsContext);
  if (!ctx) {
    throw new Error("useSavedRestaurants must be used within a SavedRestaurantsProvider");
  }
  return ctx;
}
