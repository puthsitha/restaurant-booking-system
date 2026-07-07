import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = {
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
  };
  const restaurant = { findUnique: vi.fn() };
  const savedRestaurant = {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  };

  return { prisma: { user, restaurant, savedRestaurant } };
});

const app = createApp();

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const dinerToken = tokenFor("user_diner_1", "DINER");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/saved-restaurants", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/saved-restaurants");
    expect(res.status).toBe(401);
  });

  it("lists the signed-in user's saved restaurants", async () => {
    vi.mocked(prisma.savedRestaurant.findMany).mockResolvedValueOnce([
      {
        id: "sr_1",
        createdAt: new Date(),
        restaurant: {
          id: "r_1",
          name: "Malis",
          cuisine: { name: "Khmer", nameKm: null },
          city: { name: "Phnom Penh", nameKm: null },
        },
      },
    ]);

    const res = await request(app)
      .get("/api/saved-restaurants")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.savedRestaurants).toHaveLength(1);
  });
});

describe("POST /api/saved-restaurants", () => {
  it("returns 404 for a restaurant that doesn't exist", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/saved-restaurants")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ restaurantId: "missing" });

    expect(res.status).toBe(404);
    expect(prisma.savedRestaurant.upsert).not.toHaveBeenCalled();
  });

  it("saves a restaurant idempotently", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({ id: "r_1" });
    vi.mocked(prisma.savedRestaurant.upsert).mockResolvedValueOnce({
      id: "sr_1",
      restaurant: { id: "r_1" },
    });

    const res = await request(app)
      .post("/api/saved-restaurants")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ restaurantId: "r_1" });

    expect(res.status).toBe(201);
    expect(prisma.savedRestaurant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_restaurantId: { userId: "user_diner_1", restaurantId: "r_1" } },
      }),
    );
  });
});

describe("DELETE /api/saved-restaurants/:restaurantId", () => {
  it("removes the saved restaurant for the signed-in user", async () => {
    const res = await request(app)
      .delete("/api/saved-restaurants/r_1")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(204);
    expect(prisma.savedRestaurant.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_diner_1", restaurantId: "r_1" },
    });
  });
});
