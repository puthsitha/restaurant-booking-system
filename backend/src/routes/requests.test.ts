import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = { findUnique: vi.fn(), update: vi.fn() };
  const restaurant = { count: vi.fn() };
  const restaurantRequest = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };

  const client = {
    user,
    restaurant,
    restaurantRequest,
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(client)),
  };

  return { prisma: client };
});

const app = createApp();

const OWNER_ID = "user_owner_1";
const ADMIN_ID = "user_admin_1";

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const ownerToken = tokenFor(OWNER_ID, "OWNER");
const adminToken = tokenFor(ADMIN_ID, "ADMIN");
const dinerToken = tokenFor("user_diner_1", "DINER");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/restaurant-requests", () => {
  it("rejects non-owners", async () => {
    const res = await request(app)
      .post("/api/restaurant-requests")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ requestedCount: 5, reason: "Growing fast" });
    expect(res.status).toBe(403);
  });

  it("requires a non-empty reason", async () => {
    const res = await request(app)
      .post("/api/restaurant-requests")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ requestedCount: 5, reason: "" });
    expect(res.status).toBe(400);
  });

  it("rejects a requestedCount at or below the current limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 3,
    });

    const res = await request(app)
      .post("/api/restaurant-requests")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ requestedCount: 3, reason: "Growing fast" });

    expect(res.status).toBe(400);
    expect(prisma.restaurantRequest.create).not.toHaveBeenCalled();
  });

  it("rejects a second request while one is already pending", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 3,
    });
    vi.mocked(prisma.restaurantRequest.findFirst).mockResolvedValueOnce({
      id: "req_1",
      status: "PENDING",
    });

    const res = await request(app)
      .post("/api/restaurant-requests")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ requestedCount: 5, reason: "Growing fast" });

    expect(res.status).toBe(409);
  });

  it("creates a pending request", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 3,
    });
    vi.mocked(prisma.restaurantRequest.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(3);
    vi.mocked(prisma.restaurantRequest.create).mockResolvedValueOnce({
      id: "req_1",
      ownerId: OWNER_ID,
      currentCount: 3,
      requestedCount: 5,
      reason: "Growing fast",
      status: "PENDING",
    });

    const res = await request(app)
      .post("/api/restaurant-requests")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ requestedCount: 5, reason: "Growing fast" });

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe("PENDING");
  });
});

describe("GET /api/restaurant-requests", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .get("/api/restaurant-requests")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("lists requests for an admin", async () => {
    vi.mocked(prisma.restaurantRequest.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.restaurantRequest.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .get("/api/restaurant-requests?status=PENDING")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.restaurantRequest.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.status).toBe("PENDING");
  });
});

describe("PATCH /api/restaurant-requests/:id/review", () => {
  it("requires a reviewNote", async () => {
    const res = await request(app)
      .patch("/api/restaurant-requests/req_1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED", reviewNote: "" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a request that doesn't exist", async () => {
    vi.mocked(prisma.restaurantRequest.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .patch("/api/restaurant-requests/req_1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED", reviewNote: "Looks good" });

    expect(res.status).toBe(404);
  });

  it("rejects reviewing a request that's already been decided", async () => {
    vi.mocked(prisma.restaurantRequest.findUnique).mockResolvedValueOnce({
      id: "req_1",
      status: "APPROVED",
    });

    const res = await request(app)
      .patch("/api/restaurant-requests/req_1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DENIED", reviewNote: "Too late" });

    expect(res.status).toBe(409);
  });

  it("approving bumps the owner's restaurant limit to the requested count", async () => {
    vi.mocked(prisma.restaurantRequest.findUnique).mockResolvedValueOnce({
      id: "req_1",
      ownerId: OWNER_ID,
      status: "PENDING",
      requestedCount: 5,
    });
    vi.mocked(prisma.restaurantRequest.update).mockResolvedValueOnce({
      id: "req_1",
      status: "APPROVED",
      reviewNote: "Looks good",
    });

    const res = await request(app)
      .patch("/api/restaurant-requests/req_1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED", reviewNote: "Looks good" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: OWNER_ID },
      data: { restaurantLimit: 5 },
    });
  });

  it("denying leaves the owner's restaurant limit untouched", async () => {
    vi.mocked(prisma.restaurantRequest.findUnique).mockResolvedValueOnce({
      id: "req_1",
      ownerId: OWNER_ID,
      status: "PENDING",
      requestedCount: 5,
    });
    vi.mocked(prisma.restaurantRequest.update).mockResolvedValueOnce({
      id: "req_1",
      status: "DENIED",
      reviewNote: "Not yet",
    });

    const res = await request(app)
      .patch("/api/restaurant-requests/req_1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DENIED", reviewNote: "Not yet" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
