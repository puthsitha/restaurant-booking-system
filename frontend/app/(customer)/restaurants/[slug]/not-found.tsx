"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { SearchOffIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function RestaurantNotFound() {
  const { t } = useLanguage();
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 32px" }}>
      <EmptyState
        icon={SearchOffIcon}
        title={t("routeStates.restaurantNotFoundTitle")}
        message={t("routeStates.restaurantNotFoundMessage")}
        actionLabel={t("bookingsPage.browseRestaurants")}
        actionHref="/search"
      />
    </main>
  );
}
