import { apiFetch } from "@/lib/api";
import type { PlatformSettings } from "@/lib/platformSettings/types";

export function getSettings(token: string): Promise<{ settings: PlatformSettings }> {
  return apiFetch("/api/settings", { token });
}

export function updateSettings(
  input: Partial<PlatformSettings>,
  token: string,
): Promise<{ settings: PlatformSettings }> {
  return apiFetch("/api/settings", { method: "PATCH", body: input, token });
}
