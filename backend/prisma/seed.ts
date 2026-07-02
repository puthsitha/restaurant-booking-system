import { PrismaClient } from "@prisma/client";

import { DEV_FIXTURES } from "../src/lib/devFixtures";
import { hashPassword } from "../src/lib/password";

// Dev-only fixture: platform ADMIN and restaurant OWNER accounts can't be
// created through the public signup endpoint by design, so this seed
// provisions them directly for local testing (e.g. scripts/get-dev-tokens.ts).
// Never run against a production database.
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = DEV_FIXTURES.admin;
  const adminPasswordHash = await hashPassword(admin.password);
  await prisma.user.upsert({
    where: { email: admin.email },
    update: { passwordHash: adminPasswordHash, role: "ADMIN" },
    create: { name: admin.name, email: admin.email, passwordHash: adminPasswordHash, role: "ADMIN" },
  });
  // eslint-disable-next-line no-console
  console.log(`Seeded admin account: ${admin.email}`);

  const owner = DEV_FIXTURES.owner;
  const ownerPasswordHash = await hashPassword(owner.password);
  await prisma.user.upsert({
    where: { email: owner.email },
    update: { passwordHash: ownerPasswordHash, role: "OWNER" },
    create: { name: owner.name, email: owner.email, passwordHash: ownerPasswordHash, role: "OWNER" },
  });
  // eslint-disable-next-line no-console
  console.log(`Seeded owner account: ${owner.email}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
