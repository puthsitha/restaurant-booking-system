"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/lib/i18n/context";

export default function CustomerLoading() {
  const { t } = useLanguage();
  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
      <LoadingSpinner label={t("routeStates.findingYourTable")} size="lg" />
    </main>
  );
}
