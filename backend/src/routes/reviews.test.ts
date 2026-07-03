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
  const review = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    groupBy: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return { prisma: { user, restaurant, review } };
});

const app = createApp();

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const dinerToken = tokenFor("user_diner_1", "DINER");
const ownerToken = tokenFor("user_owner_1", "OWNER");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.review.groupBy).mockResolvedValue([]);
});

describe("GET /api/restaurants/:id/reviews", () => {
  it("is public and returns a rating distribution", async () => {
    vi.mocked(prisma.review.findMany).mockResolvedValueOnce([
      { id: "rev_1", rating: 5, text: "Great!" },
    ]);
    vi.mocked(prisma.review.groupBy).mockResolvedValueOnce([
      { rating: 5, _count: { rating: 1 } },
    ]);

    const res = await request(app).get("/api/restaurants/r_1/reviews");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.average).toBe(5);
    expect(res.body.countByRating[5]).toBe(1);
  });
});

describe("POST /api/restaurants/:id/reviews", () => {
  it("rejects non-diners", async () => {
    const res = await request(app)
      .post("/api/restaurants/r_1/reviews")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ rating: 5 });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a restaurant that doesn't exist", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/restaurants/r_1/reviews")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ rating: 5 });

    expect(res.status).toBe(404);
  });

  it("rejects a duplicate review from the same diner", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      id: "r_1",
      status: "ACTIVE",
    });
    vi.mocked(prisma.review.findFirst).mockResolvedValueOnce({ id: "rev_existing" });

    const res = await request(app)
      .post("/api/restaurants/r_1/reviews")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ rating: 4 });

    expect(res.status).toBe(409);
    expect(prisma.review.create).not.toHaveBeenCalled();
  });

  it("creates a review", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      id: "r_1",
      status: "ACTIVE",
    });
    vi.mocked(prisma.review.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.review.create).mockResolvedValueOnce({
      id: "rev_1",
      rating: 4,
      text: "Nice",
    });

    const res = await request(app)
      .post("/api/restaurants/r_1/reviews")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ rating: 4, text: "Nice" });

    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(4);
  });
});

describe("PATCH /api/reviews/:id", () => {
  it("rejects non-diners", async () => {
    const res = await request(app)
      .patch("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ rating: 4 });
    expect(res.status).toBe(403);
  });

  it("returns 404 when the review isn't the diner's own", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      userId: "someone_else",
    });

    const res = await request(app)
      .patch("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ rating: 4 });

    expect(res.status).toBe(404);
    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it("updates the diner's own review", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      userId: "user_diner_1",
    });
    vi.mocked(prisma.review.update).mockResolvedValueOnce({
      id: "rev_1",
      rating: 3,
      text: "Updated my mind",
    });

    const res = await request(app)
      .patch("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ rating: 3, text: "Updated my mind" });

    expect(res.status).toBe(200);
    expect(res.body.review.rating).toBe(3);
  });
});

describe("DELETE /api/reviews/:id", () => {
  it("rejects non-diners", async () => {
    const res = await request(app)
      .delete("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("returns 404 when the review isn't the diner's own", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      userId: "someone_else",
    });

    const res = await request(app)
      .delete("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(404);
    expect(prisma.review.delete).not.toHaveBeenCalled();
  });

  it("deletes the diner's own review", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      userId: "user_diner_1",
    });
    vi.mocked(prisma.review.delete).mockResolvedValueOnce({ id: "rev_1" });

    const res = await request(app)
      .delete("/api/reviews/rev_1")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(204);
  });
});

describe("PATCH /api/reviews/:id/reply", () => {
  it("rejects non-owners", async () => {
    const res = await request(app)
      .patch("/api/reviews/rev_1/reply")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ reply: "Thanks!" });
    expect(res.status).toBe(403);
  });

  it("returns 404 when the review isn't at one of the owner's restaurants", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      restaurant: { ownerId: "someone_else" },
    });

    const res = await request(app)
      .patch("/api/reviews/rev_1/reply")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ reply: "Thanks!" });

    expect(res.status).toBe(404);
    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it("saves the owner's reply", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
      id: "rev_1",
      restaurant: { ownerId: "user_owner_1" },
    });
    vi.mocked(prisma.review.update).mockResolvedValueOnce({
      id: "rev_1",
      ownerReply: "Thanks for visiting!",
    });

    const res = await request(app)
      .patch("/api/reviews/rev_1/reply")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ reply: "Thanks for visiting!" });

    expect(res.status).toBe(200);
    expect(res.body.review.ownerReply).toBe("Thanks for visiting!");
  });
});
