import { z } from "zod";

export const updatePlatformSettingsSchema = z.object({
  defaultRestaurantLimit: z.number().int().min(1).max(100).optional(),
  autoApproveOwners: z.boolean().optional(),
  requireKhqrDeposits: z.boolean().optional(),
  platformFeePerBooking: z.number().min(0).max(1000).optional(),
});
export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;
