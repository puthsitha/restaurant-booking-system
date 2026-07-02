import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

// Dev-only fixture: platform ADMIN accounts can't be created through the
// public signup endpoint by design, so this seed provisions one directly
// for local testing (e.g. scripts/get-dev-tokens.ts). Never run against a
// production database.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin.dev@tablesite.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password123";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: "ADMIN" },
    create: {
      name: "Dev Platform Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin account: ${ADMIN_EMAIL}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
