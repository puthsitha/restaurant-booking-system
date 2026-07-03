import { prisma } from "../lib/prisma";
import type { UpdatePlatformSettingsInput } from "../schemas/platformSetting.schemas";

export interface PlatformSettings {
  defaultRestaurantLimit: number;
  autoApproveOwners: boolean;
  requireKhqrDeposits: boolean;
  platformFeePerBooking: number;
}

const DEFAULTS: PlatformSettings = {
  defaultRestaurantLimit: 3,
  autoApproveOwners: false,
  requireKhqrDeposits: false,
  platformFeePerBooking: 0,
};

// Maps each typed setting to the PlatformSetting.key it's stored under, and
// how to parse the stored string back into its typed value.
const FIELD_KEYS: { [K in keyof PlatformSettings]: string } = {
  defaultRestaurantLimit: "default_restaurant_limit",
  autoApproveOwners: "auto_approve_owners",
  requireKhqrDeposits: "require_khqr_deposits",
  platformFeePerBooking: "platform_fee_per_booking",
};

function parseValue<K extends keyof PlatformSettings>(key: K, raw: string): PlatformSettings[K] {
  const fallback = DEFAULTS[key];
  if (typeof fallback === "boolean") {
    return (raw === "true") as PlatformSettings[K];
  }
  const parsed = Number(raw);
  return (Number.isFinite(parsed) ? parsed : fallback) as PlatformSettings[K];
}

export async function getSettings(): Promise<PlatformSettings> {
  const rows = await prisma.platformSetting.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const settings = { ...DEFAULTS };
  for (const field of Object.keys(FIELD_KEYS) as (keyof PlatformSettings)[]) {
    const raw = byKey.get(FIELD_KEYS[field]);
    if (raw !== undefined) {
      (settings[field] as unknown) = parseValue(field, raw);
    }
  }
  return settings;
}

export async function updateSettings(
  input: UpdatePlatformSettingsInput,
): Promise<PlatformSettings> {
  const entries = Object.entries(input) as [keyof PlatformSettings, boolean | number][];
  await Promise.all(
    entries.map(([field, value]) =>
      prisma.platformSetting.upsert({
        where: { key: FIELD_KEYS[field] },
        create: { key: FIELD_KEYS[field], value: String(value) },
        update: { value: String(value) },
      }),
    ),
  );
  return getSettings();
}
