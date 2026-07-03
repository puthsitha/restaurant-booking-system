import { z } from "zod";

export const paymentMethodBrandEnum = z.enum(["ABA", "WING", "BAKONG", "ACLEDA"]);

export const createPaymentMethodSchema = z.object({
  brand: paymentMethodBrandEnum,
  label: z.string().trim().min(1).max(80),
  detail: z.string().trim().max(120).optional(),
  isDefault: z.boolean().default(false),
});
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
