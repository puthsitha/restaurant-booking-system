import { createApp } from "./app";
import { env } from "./env";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`TableSite API listening on http://localhost:${env.port}`);
});

// Graceful shutdown: stop accepting new connections, then close the database
// pool so in-flight requests can finish and we don't leak connections.
function shutdown(signal: string): void {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down…`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
  // Force-exit if a connection refuses to close in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
