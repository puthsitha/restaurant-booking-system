import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = {
    findUnique: vi.fn(),
    // Used by the `authenticate` middleware to check the token subject is
    // still active; defaults to "found and active" so existing tests don't
    // need to stub it, and is overridden per-test to simulate suspension.
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
    findMany: vi.fn(),
    create: vi.fn(),
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

describe("POST /api/users", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "New Owner", email: "new-owner@example.com", password: "password123" });
    expect(res.status).toBe(403);
  });

  it("rejects a weak/incomplete payload", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "not-an-email", password: "short" });
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "user_owner_9" });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "New Owner", email: "owner@example.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates an owner account with the default restaurant limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: "user_owner_9",
      role: "OWNER",
      name: "New Owner",
      email: "owner@example.com",
      restaurantLimit: 3,
    });

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "New Owner", email: "owner@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("OWNER");
    const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
    expect(createArgs?.data.role).toBe("OWNER");
    expect(createArgs?.data.restaurantLimit).toBe(3);
    expect(createArgs?.data.passwordHash).not.toBe("password123");
  });
});

describe("PATCH /api/users/:id/status", () => {
  it("rejects a status change with no reason", async () => {
    const res = await request(app)
      .patch("/api/users/user_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns 404 for a user that doesn't exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .patch("/api/users/user_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED", reason: "Repeated no-shows" });

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
      .send({ status: "SUSPENDED", reason: "Repeated no-shows" });

    expect(res.status).toBe(404);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("suspends a diner account and records the reason", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_diner_1",
      role: "DINER",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user_diner_1",
      status: "SUSPENDED",
      statusReason: "Repeated no-shows",
    });

    const res = await request(app)
      .patch("/api/users/user_diner_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "SUSPENDED", reason: "Repeated no-shows" });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe("SUSPENDED");
    expect(res.body.user.statusReason).toBe("Repeated no-shows");
    expect(vi.mocked(prisma.user.update).mock.calls[0]?.[0]?.data).toEqual({
      status: "SUSPENDED",
      statusReason: "Repeated no-shows",
    });
  });

  it("reactivates a suspended owner account and records the reason", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_owner_9",
      role: "OWNER",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user_owner_9",
      status: "ACTIVE",
      statusReason: "Dispute resolved",
    });

    const res = await request(app)
      .patch("/api/users/user_owner_9/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ACTIVE", reason: "Dispute resolved" });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe("ACTIVE");
    expect(res.body.user.statusReason).toBe("Dispute resolved");
  });
});

describe("PATCH /api/users/:id/restaurant-limit", () => {
  it("returns 404 for a diner (not an owner)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_diner_1",
      role: "DINER",
    });

    const res = await request(app)
      .patch("/api/users/user_diner_1/restaurant-limit")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ restaurantLimit: 5 });

    expect(res.status).toBe(404);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("updates an owner's restaurant limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user_owner_9",
      role: "OWNER",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user_owner_9",
      role: "OWNER",
      restaurantLimit: 5,
    });

    const res = await request(app)
      .patch("/api/users/user_owner_9/restaurant-limit")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ restaurantLimit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.user.restaurantLimit).toBe(5);
  });
});
