"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ClosuresTab } from "@/components/restaurants/manage/ClosuresTab";
import { GalleryTab } from "@/components/restaurants/manage/GalleryTab";
import { HoursTab } from "@/components/restaurants/manage/HoursTab";
import { MenuTab } from "@/components/restaurants/manage/MenuTab";
import { ProfileTab } from "@/components/restaurants/manage/ProfileTab";
import { ReviewsTab } from "@/components/restaurants/manage/ReviewsTab";
import { TablesTab } from "@/components/restaurants/manage/TablesTab";
import { TagsTab } from "@/components/restaurants/manage/TagsTab";
import type { DirtyTabHandle } from "@/components/restaurants/manage/types";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getRestaurant } from "@/lib/restaurants/api";
import type { RestaurantManagementDetail, RestaurantStatus } from "@/lib/restaurants/types";

const STATUS_TONE: Record<RestaurantStatus, StatusTone> = {
  PENDING: "pending",
  ACTIVE: "success",
  DISABLED: "danger",
};

const OWNER_TABS = [
  { key: "profile", labelKey: "ownerRestaurantDetail.tabProfile" },
  { key: "hours", labelKey: "ownerRestaurantDetail.tabHours" },
  { key: "tables", labelKey: "ownerRestaurantDetail.tabTables" },
  { key: "menu", labelKey: "ownerRestaurantDetail.tabMenu" },
  { key: "gallery", labelKey: "ownerRestaurantDetail.tabGallery" },
  { key: "closures", labelKey: "ownerRestaurantDetail.tabClosures" },
  { key: "reviews", labelKey: "ownerRestaurantDetail.tabReviews" },
  { key: "tags", labelKey: "ownerRestaurantDetail.tabTags" },
] as const satisfies { key: string; labelKey: TranslationKey }[];

type TabKey = (typeof OWNER_TABS)[number]["key"];
const TAB_LABEL_KEY: Record<TabKey, TranslationKey> = Object.fromEntries(
  OWNER_TABS.map((tab) => [tab.key, tab.labelKey]),
) as Record<TabKey, TranslationKey>;

// Only these tabs hold a draft the owner can lose — the others save each
// action immediately (add/delete/toggle), so there's nothing to guard there.
const DRAFT_TABS = new Set<TabKey>(["profile", "hours", "tags"]);

type PendingNav = { type: "tab"; key: TabKey } | { type: "href"; href: string } | null;

export default function ManageRestaurantPage({ params }: { params: { id: string } }) {
  const { token } = useOwnerAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantManagementDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("profile");
  const [isDirty, setIsDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
  const activeTabRef = useRef<DirtyTabHandle>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const res = await getRestaurant(params.id, token);
      setRestaurant(res.restaurant);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ownerRestaurantDetail.loadError"));
    }
  }, [params.id, token, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Native "leave site?" prompt for a real page unload (refresh, close tab,
  // typing a new URL) — the browser controls the wording, but it still stops
  // an accidental loss of an unsaved draft.
  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent): void {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // In-app navigation (sidebar links, "back to restaurants", etc.) doesn't
  // trigger beforeunload, so intercept clicks on internal links while a
  // draft tab is dirty and route through the same confirmation prompt.
  useEffect(() => {
    if (!isDirty) return;
    function handleClick(e: MouseEvent): void {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      e.preventDefault();
      setPendingNav({ type: "href", href: url.pathname + url.search + url.hash });
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  function requestTabChange(next: TabKey): void {
    if (next === tab) return;
    if (isDirty) {
      setPendingNav({ type: "tab", key: next });
      return;
    }
    setTab(next);
  }

  function resolvePendingNav(): void {
    if (!pendingNav) return;
    if (pendingNav.type === "tab") {
      setTab(pendingNav.key);
    } else {
      router.push(pendingNav.href);
    }
    setPendingNav(null);
  }

  async function handleSaveAndContinue(): Promise<void> {
    setIsSavingAndLeaving(true);
    try {
      const saved = await activeTabRef.current?.save();
      if (saved) {
        resolvePendingNav();
      }
    } finally {
      setIsSavingAndLeaving(false);
    }
  }

  if (error) {
    return (
      <main className="p-8">
        <ErrorState message={error} onRetry={reload} />
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="p-8">
        <LoadingSpinner label={t("ownerRestaurantDetail.settingUpKitchen")} size="lg" />
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="disp text-2xl font-extrabold text-ink">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-muted">/{restaurant.slug}</p>
        </div>
        <StatusBadge tone={STATUS_TONE[restaurant.status]}>{restaurant.status}</StatusBadge>
      </div>

      {restaurant.status === "PENDING" && (
        <p className="mt-3 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-ink">
          {t("ownerRestaurantDetail.pendingReviewNote")}
        </p>
      )}

      {restaurant.statusReason && (
        <div className="mt-3 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-ink">
          <span className="font-bold">{t("ownerRestaurantDetail.adminNotePrefix")}</span>
          {restaurant.statusReason}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {OWNER_TABS.map((ownerTab) => (
          <button
            key={ownerTab.key}
            onClick={() => requestTabChange(ownerTab.key)}
            className={`relative rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === ownerTab.key ? "border-b-2 border-accent text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {t(ownerTab.labelKey)}
            {tab === ownerTab.key && DRAFT_TABS.has(ownerTab.key) && isDirty && (
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "profile" && (
          <ProfileTab
            ref={activeTabRef}
            restaurant={restaurant}
            token={token!}
            onSaved={reload}
            onDirtyChange={setIsDirty}
          />
        )}
        {tab === "hours" && (
          <HoursTab
            ref={activeTabRef}
            restaurant={restaurant}
            token={token!}
            onSaved={reload}
            onDirtyChange={setIsDirty}
          />
        )}
        {tab === "tables" && (
          <TablesTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "menu" && <MenuTab restaurant={restaurant} token={token!} onSaved={reload} />}
        {tab === "gallery" && (
          <GalleryTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "closures" && (
          <ClosuresTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "reviews" && (
          <ReviewsTab restaurant={restaurant} token={token!} onSaved={reload} />
        )}
        {tab === "tags" && (
          <TagsTab
            ref={activeTabRef}
            restaurant={restaurant}
            token={token!}
            onSaved={reload}
            onDirtyChange={setIsDirty}
          />
        )}
      </div>

      <Modal
        open={pendingNav !== null}
        onClose={() => setPendingNav(null)}
        title={t("ownerRestaurantDetail.unsavedTitle")}
      >
        <p className="text-sm text-ink">
          {pendingNav?.type === "tab"
            ? t("ownerRestaurantDetail.unsavedBodySwitch", {
                tab: t(TAB_LABEL_KEY[tab]),
                nextTab: t(TAB_LABEL_KEY[pendingNav.key])
              })
            : t("ownerRestaurantDetail.unsavedBodyLeave")}{" "}
          {t("ownerRestaurantDetail.unsavedHint")}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isSavingAndLeaving}
            className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSavingAndLeaving ? t("common.saving") : t("ownerRestaurantDetail.saveContinue")}
          </button>
          <button
            type="button"
            onClick={resolvePendingNav}
            disabled={isSavingAndLeaving}
            className="w-full rounded-xl border border-border py-3 text-sm font-bold text-ink disabled:opacity-60"
          >
            {t("ownerRestaurantDetail.discardChanges")}
          </button>
          <button
            type="button"
            onClick={() => setPendingNav(null)}
            disabled={isSavingAndLeaving}
            className="w-full py-2 text-sm font-semibold text-muted"
          >
            {t("ownerRestaurantDetail.keepEditing")}
          </button>
        </div>
      </Modal>
    </main>
  );
}
