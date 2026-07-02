"use client";

import { createAuthContext } from "@/lib/auth/createAuthContext";

// Customer-site session. Diners sign in via phone OTP or Google; an owner or
// admin browsing the customer site as a diner is fine too, so no role
// restriction here.
const customerAuth = createAuthContext({
  storageKey: "tablesite.customer.token",
});

export const CustomerAuthProvider = customerAuth.Provider;
export const useCustomerAuth = customerAuth.useAuth;
