import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const user = {
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
  };
  const platformSetting = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn(),
  };

  return { prisma: { user, platformSetting } };
});

const app = createApp();

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const adminToken = tokenFor("user_admin_1", "ADMIN");
const ownerToken = tokenFor("user_owner_1", "OWNER");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.platformSetting.findMany).mockResolvedValue([]);
});

describe("GET /api/settings", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("returns defaults when no settings have been saved yet", async () => {
    const res = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.settings).toEqual({
      defaultRestaurantLimit: 3,
      autoApproveOwners: false,
      requireKhqrDeposits: false,
      platformFeePerBooking: 0,
    });
  });

  it("overlays saved values on top of the defaults", async () => {
    vi.mocked(prisma.platformSetting.findMany).mockResolvedValueOnce([
      { id: "s1", key: "default_restaurant_limit", value: "5" },
      { id: "s2", key: "auto_approve_owners", value: "true" },
    ]);

    const res = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.settings.defaultRestaurantLimit).toBe(5);
    expect(res.body.settings.autoApproveOwners).toBe(true);
    expect(res.body.settings.requireKhqrDeposits).toBe(false);
  });
});

describe("PATCH /api/settings", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .patch("/api/settings")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ autoApproveOwners: true });
    expect(res.status).toBe(403);
  });

  it("upserts only the provided keys", async () => {
    const res = await request(app)
      .patch("/api/settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ autoApproveOwners: true });

    expect(res.status).toBe(200);
    expect(prisma.platformSetting.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.platformSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "auto_approve_owners" },
        create: { key: "auto_approve_owners", value: "true" },
        update: { value: "true" },
      }),
    );
  });
});
