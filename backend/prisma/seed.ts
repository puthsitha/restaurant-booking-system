import { PrismaClient } from "@prisma/client";

import { DEV_FIXTURES } from "../src/lib/devFixtures";
import { hashPassword } from "../src/lib/password";

// Dev-only fixture: platform ADMIN accounts can't be created through the
// public signup endpoint by design, so this seed provisions one directly
// for local testing (e.g. scripts/get-dev-tokens.ts). Never run against a
// production database.
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const { email, name, password } = DEV_FIXTURES.admin;
  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { name, email, passwordHash, role: "ADMIN" },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin account: ${email}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
