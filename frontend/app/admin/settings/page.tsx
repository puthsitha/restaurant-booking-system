"use client";

import { useCallback, useEffect, useState } from "react";

import { SavedToast } from "@/components/ui/SavedToast";
import { Switch } from "@/components/ui/Switch";
import { ListSkeleton } from "@/components/ui/skeletons";
import { ApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { getSettings, updateSettings } from "@/lib/platformSettings/api";
import type { PlatformSettings } from "@/lib/platformSettings/types";

export default function AdminSettingsPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(null);
    getSettings(token)
      .then((res) => setSettings(res.settings))
      .catch(() => setError("Couldn't load platform settings."));
  }, [token]);

  useEffect(load, [load]);

  async function save(patch: Partial<PlatformSettings>): Promise<void> {
    if (!token || !settings) return;
    const previous = settings;
    setSettings({ ...settings, ...patch });
    try {
      const { settings: updated } = await updateSettings(patch, token);
      setSettings(updated);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1800);
    } catch (err) {
      setSettings(previous);
      setError(err instanceof ApiError ? err.message : "Couldn't save this setting.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="disp text-2xl font-extrabold text-ink">Platform settings</h1>
      <p className="mt-1 text-sm text-muted">Policies and defaults for the whole platform.</p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {settings === null ? (
        <div className="mt-8 max-w-xl">
          <ListSkeleton rows={4} />
        </div>
      ) : (
        <div className="mt-8 max-w-xl divide-y divide-border rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-bold text-ink">Default restaurant limit</p>
              <p className="text-sm text-muted">
                How many restaurants a newly created owner account may have.
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.defaultRestaurantLimit}
              onChange={(e) => save({ defaultRestaurantLimit: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-bold text-ink">Auto-approve restaurant-limit requests</p>
              <p className="text-sm text-muted">
                Skip admin review and approve owner requests for more restaurants automatically.
              </p>
            </div>
            <Switch
              checked={settings.autoApproveOwners}
              onChange={(checked) => save({ autoApproveOwners: checked })}
              label="Auto-approve restaurant-limit requests"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-bold text-ink">Require KHQR deposits</p>
              <p className="text-sm text-muted">
                Require every restaurant to collect a KHQR deposit to confirm a booking.
              </p>
            </div>
            <Switch
              checked={settings.requireKhqrDeposits}
              onChange={(checked) => save({ requireKhqrDeposits: checked })}
              label="Require KHQR deposits"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-bold text-ink">Platform fee per booking</p>
              <p className="text-sm text-muted">USD charged to the restaurant per confirmed booking.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={settings.platformFeePerBooking}
                onChange={(e) => save({ platformFeePerBooking: Number(e.target.value) })}
                className="w-24 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </div>
          </div>
        </div>
      )}

      <SavedToast visible={showSaved} />
    </main>
  );
}
