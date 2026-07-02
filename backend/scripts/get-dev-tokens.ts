// Logs in as a diner, a restaurant owner, and the seeded platform admin, then
// prints `export ...` lines so this can be wrapped in `eval "$(...)"` to set
// customer_token / owner_token / admin_token in your shell for manual API
// testing (curl, Postman, or pasting into Swagger UI's Authorize dialog).
//
// Usage (from repo root or backend/):
//   eval "$(npm run tokens --workspace backend --silent)"
//   curl -H "Authorization: Bearer $customer_token" http://localhost:4000/api/auth/me
//
// The admin and owner accounts must exist first: npm run prisma:seed --workspace backend

import { DEV_FIXTURES } from "../src/lib/devFixtures";

interface AuthResponse {
  user: { id: string; role: string };
  token: string;
}

interface OtpRequestResponse {
  message: string;
  devCode?: string;
}

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const CUSTOMER_PHONE = DEV_FIXTURES.customerPhone;
const OWNER_EMAIL = DEV_FIXTURES.owner.email;
const OWNER_PASSWORD = DEV_FIXTURES.owner.password;
const ADMIN_EMAIL = DEV_FIXTURES.admin.email;
const ADMIN_PASSWORD = DEV_FIXTURES.admin.password;

// Status output goes to stderr so stdout only ever contains `export ...`
// lines, which is what makes wrapping this in `eval "$(...)"` safe.
function log(message: string): void {
  process.stderr.write(`${message}\n`);
}

async function postJson<T>(
  path: string,
  body: unknown,
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

async function getCustomerToken(): Promise<string> {
  log(`[customer] requesting OTP for ${CUSTOMER_PHONE}...`);
  const requested = await postJson<OtpRequestResponse>("/api/auth/otp/request", {
    phone: CUSTOMER_PHONE,
  });
  if (requested.status !== 200 || !requested.data.devCode) {
    throw new Error(
      "Could not get a dev OTP code — is the backend running with NODE_ENV != production?",
    );
  }

  const verified = await postJson<AuthResponse>("/api/auth/otp/verify", {
    phone: CUSTOMER_PHONE,
    code: requested.data.devCode,
  });
  if (verified.status !== 200) {
    throw new Error(`OTP verify failed (${verified.status})`);
  }
  log(`[customer] logged in as ${CUSTOMER_PHONE}`);
  return verified.data.token;
}

async function getOwnerToken(): Promise<string> {
  log(`[owner] logging in as ${OWNER_EMAIL}...`);
  const login = await postJson<AuthResponse>("/api/auth/login", {
    email: OWNER_EMAIL,
    password: OWNER_PASSWORD,
  });
  if (login.status !== 200) {
    throw new Error(
      `Owner login failed (${login.status}) — seed the dev owner first: ` +
        "npm run prisma:seed --workspace backend",
    );
  }
  log(`[owner] logged in as ${OWNER_EMAIL}`);
  return login.data.token;
}

async function getAdminToken(): Promise<string> {
  log(`[admin] logging in as ${ADMIN_EMAIL}...`);
  const login = await postJson<AuthResponse>("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (login.status !== 200) {
    throw new Error(
      `Admin login failed (${login.status}) — seed the dev admin first: ` +
        "npm run prisma:seed --workspace backend",
    );
  }
  log(`[admin] logged in as ${ADMIN_EMAIL}`);
  return login.data.token;
}

async function main(): Promise<void> {
  const customerToken = await getCustomerToken();
  const ownerToken = await getOwnerToken();
  const adminToken = await getAdminToken();

  console.log(`export customer_token="${customerToken}"`);
  console.log(`export owner_token="${ownerToken}"`);
  console.log(`export admin_token="${adminToken}"`);
}

main().catch((err) => {
  log(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
