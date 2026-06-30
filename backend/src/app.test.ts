import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "./app";
import { prisma } from "./lib/prisma";

// The readiness route is the only thing that touches the database; mock the
// client so these stay fast unit tests with no real Postgres.
vi.mock("./lib/prisma", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

const app = createApp();

describe("health & security", () => {
  it("liveness returns ok without touching the database", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "tablesite-backend" });
  });

  it("sends hardening headers and hides the Express fingerprint", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("returns a clean 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not Found" });
  });

  it("readiness reports the database up when reachable", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.database).toBe("up");
  });

  it("readiness returns 503 when the database is unreachable", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error("down"));
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(503);
    expect(res.body.database).toBe("down");
  });
});
