"use client";

import { createAuthContext } from "@/lib/auth/createAuthContext";

// Owner-portal session (/owner/*). Strictly OWNER accounts: an admin or
// diner logging in here is rejected with a pointer to the right place.
const ownerAuth = createAuthContext({
  storageKey: "tablesite.owner.token",
  allowedRoles: ["OWNER"],
  wrongRoleMessage:
    "This isn't a restaurant owner account. Admins sign in at /admin/login; diners use the main site.",
});

export const OwnerAuthProvider = ownerAuth.Provider;
export const useOwnerAuth = ownerAuth.useAuth;
