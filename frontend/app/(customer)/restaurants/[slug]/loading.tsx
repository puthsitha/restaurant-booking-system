"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/lib/i18n/context";

export default function RestaurantDetailLoading() {
  const { t } = useLanguage();
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 32px" }}>
      <LoadingSpinner label={t("routeStates.settingTheTable")} size="lg" />
    </main>
  );
}
