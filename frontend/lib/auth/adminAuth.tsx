"use client";

import { createAuthContext } from "@/lib/auth/createAuthContext";

// Admin-portal session (/admin/*). Strictly ADMIN accounts — admins manage
// the platform (including owners); owners have their own portal.
const adminAuth = createAuthContext({
  storageKey: "tablesite.admin.token",
  allowedRoles: ["ADMIN"],
  wrongRoleMessage:
    "This isn't a platform admin account. Restaurant owners sign in at /owner/login.",
});

export const AdminAuthProvider = adminAuth.Provider;
export const useAdminAuth = adminAuth.useAuth;
