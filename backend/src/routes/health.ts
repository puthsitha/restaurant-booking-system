import { Router } from "express";

import { prisma } from "../lib/prisma";

export const healthRouter: Router = Router();

// Liveness probe: the process is up. Cheap, no external dependencies.
healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "tablesite-backend" });
});

// Readiness probe: can we actually serve traffic? Verifies the database is
// reachable so orchestrators don't route requests to an instance that can't
// talk to Postgres.
healthRouter.get("/health/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", database: "up" });
  } catch {
    res.status(503).json({ status: "unavailable", database: "down" });
  }
});
