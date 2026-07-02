import type { RestaurantManagementDetail } from "@/lib/restaurants/types";

export interface ManageTabProps {
  restaurant: RestaurantManagementDetail;
  token: string;
  onSaved: () => Promise<void>;
  // Only implemented by tabs that hold a draft the owner can lose (Profile,
  // Hours, Tags) — the manage page uses it to warn before switching tabs,
  // navigating away, or reloading with unsaved edits.
  onDirtyChange?: (dirty: boolean) => void;
}

// Imperative handle exposed by draft-style tabs so the manage page's
// unsaved-changes prompt can trigger a save without owning the tab's fields.
export interface DirtyTabHandle {
  save: () => Promise<boolean>;
}
