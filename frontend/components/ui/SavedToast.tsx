"use client";

import { AnimatePresence, motion } from "framer-motion";

import { CheckIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

// A brief, friendly confirmation that a draft-style tab's changes landed —
// shown for a couple of seconds right where the Save button was, so the
// owner doesn't have to guess whether the click registered.
export function SavedToast({ visible }: { visible: boolean }) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="sticky bottom-4 z-20 mt-6 flex w-fit items-center gap-2 rounded-2xl border border-secondary/30 bg-surface px-4 py-2.5 text-sm font-semibold text-secondary shadow-lg"
        >
          <CheckIcon className="h-4 w-4" />
          {t("common.saved")}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
