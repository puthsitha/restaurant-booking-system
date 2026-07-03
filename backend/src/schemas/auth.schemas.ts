import { z } from "zod";

// E.164 Cambodian mobile number, e.g. "+85512345678".
const cambodianPhone = z
  .string()
  .trim()
  .regex(/^\+855[1-9]\d{7,8}$/, "Enter a valid Cambodian phone number");

// Public signup can only ever create DINER accounts. OWNER accounts are
// provisioned by an admin (see user.schemas.ts createOwnerSchema); ADMIN is
// granted out-of-band. Neither is reachable through this endpoint.
export const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export const otpRequestSchema = z.object({
  phone: cambodianPhone,
});
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  phone: cambodianPhone,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  preferredLocale: z.enum(["km", "en"]).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
