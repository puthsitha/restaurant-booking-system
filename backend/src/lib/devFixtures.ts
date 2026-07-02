// Shared dev-only test identities used by prisma/seed.ts,
// scripts/get-dev-tokens.ts, and the Swagger "dev quick-login" buttons
// (src/docs/devAuth.ts). Never used by application runtime code — purely
// local developer tooling, all overridable via env vars.
export const DEV_FIXTURES = {
  customerPhone: process.env.SEED_CUSTOMER_PHONE ?? "+85512340000",
  owner: {
    name: process.env.SEED_OWNER_NAME ?? "Dev Owner",
    email: process.env.SEED_OWNER_EMAIL ?? "owner.dev@tablesite.local",
    password: process.env.SEED_OWNER_PASSWORD ?? "password123",
  },
  admin: {
    name: "Dev Platform Admin",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin.dev@tablesite.local",
    password: process.env.SEED_ADMIN_PASSWORD ?? "password123",
  },
} as const;
