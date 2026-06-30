import { PrismaClient } from "@prisma/client";

import { env } from "../env";

// Reuse a single PrismaClient across dev hot-reloads so we don't exhaust the
// database connection pool by creating a new client on every reload.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ["error"] : ["warn", "error"],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
