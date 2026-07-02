import type { RestaurantManagementDetail } from "@/lib/restaurants/types";

export interface ManageTabProps {
  restaurant: RestaurantManagementDetail;
  token: string;
  onSaved: () => Promise<void>;
}
