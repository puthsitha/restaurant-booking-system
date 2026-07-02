import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };

  return { prisma: { user } };
});

const app = createApp();

const ADMIN_ID = "user_admin_1";

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const adminToken = tokenFor(ADMIN_ID, "ADMIN");
const ownerToken = tokenFor("user_owner_1", "OWNER");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/users", () => {
  it("rejects non-admins", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("defaults to diners and owners only", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.user.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.role).toEqual({ in: ["DINER", "OWNER"] });
  });

  it("filters by role and searches by name/phone", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .get("/api/users?role=OWNER&search=sopheak")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.user.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.role).toBe("OWNER");
    expect(whereArg?.OR).toEqual([
      { name: { contains: "sopheak", mode: "insensitive" } },
      { phone: { contains: "sopheak", mode: "insensitive" } },
    ]);
  });

  it("rejects an invalid role filter", async () => {
    const res = await request(app)
      .get("/api/users?role=ADMIN")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/users/:id/status", () => {
  it("returns 404 for a user that doesn't exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .patch("/api/users/user_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(404);
  });

  it("refuses to touch another admin account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_admin_2",
      role: "ADMIN",
    });

    const res = await request(app)
      .patch("/api/users/user_admin_2/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(404);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("suspends a diner account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_diner_1",
      role: "DINER",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user_diner_1",
      status: "SUSPENDED",
    });

    const res = await request(app)
      .patch("/api/users/user_diner_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe("SUSPENDED");
  });

  it("reactivates a suspended owner account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_owner_9",
      role: "OWNER",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user_owner_9",
      status: "ACTIVE",
    });

    const res = await request(app)
      .patch("/api/users/user_owner_9/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ACTIVE" });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe("ACTIVE");
  });
});
