import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = {
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
  };
  const paymentMethod = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  };

  return { prisma: { user, paymentMethod } };
});

const app = createApp();

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const dinerToken = tokenFor("user_diner_1", "DINER");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/payment-methods", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/payment-methods");
    expect(res.status).toBe(401);
  });

  it("lists the signed-in user's payment methods", async () => {
    vi.mocked(prisma.paymentMethod.findMany).mockResolvedValueOnce([
      { id: "pm_1", brand: "ABA", label: "My ABA", isDefault: true },
    ]);

    const res = await request(app)
      .get("/api/payment-methods")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.paymentMethods).toHaveLength(1);
  });
});

describe("POST /api/payment-methods", () => {
  it("rejects an invalid brand", async () => {
    const res = await request(app)
      .post("/api/payment-methods")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ brand: "VISA", label: "My card" });

    expect(res.status).toBe(400);
    expect(prisma.paymentMethod.create).not.toHaveBeenCalled();
  });

  it("unsets other defaults when creating a new default method", async () => {
    vi.mocked(prisma.paymentMethod.create).mockResolvedValueOnce({
      id: "pm_2",
      brand: "WING",
      label: "My Wing",
      isDefault: true,
    });

    const res = await request(app)
      .post("/api/payment-methods")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({ brand: "WING", label: "My Wing", isDefault: true });

    expect(res.status).toBe(201);
    expect(prisma.paymentMethod.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_diner_1" },
      data: { isDefault: false },
    });
  });
});

describe("DELETE /api/payment-methods/:id", () => {
  it("returns 404 when the method doesn't belong to the caller", async () => {
    vi.mocked(prisma.paymentMethod.findUnique).mockResolvedValueOnce({
      id: "pm_1",
      userId: "someone_else",
    });

    const res = await request(app)
      .delete("/api/payment-methods/pm_1")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(404);
    expect(prisma.paymentMethod.delete).not.toHaveBeenCalled();
  });

  it("deletes a method owned by the caller", async () => {
    vi.mocked(prisma.paymentMethod.findUnique).mockResolvedValueOnce({
      id: "pm_1",
      userId: "user_diner_1",
    });

    const res = await request(app)
      .delete("/api/payment-methods/pm_1")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(204);
    expect(prisma.paymentMethod.delete).toHaveBeenCalledWith({ where: { id: "pm_1" } });
  });
});
