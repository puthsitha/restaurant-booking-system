import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const restaurant = { findUnique: vi.fn(), findMany: vi.fn() };
  const operatingHours = { findUnique: vi.fn() };
  const specialClosure = { findUnique: vi.fn() };
  const restaurantTable = { findMany: vi.fn(), count: vi.fn() };
  const reservation = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };
  const payment = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const user = {
    findUnique: vi.fn(),
    // Used by the `authenticate` middleware to check the token subject is
    // still active; defaults to "found and active" so existing tests don't
    // need to stub it, and is overridden per-test to simulate suspension.
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
    create: vi.fn(),
  };

  const client = {
    restaurant,
    operatingHours,
    specialClosure,
    restaurantTable,
    reservation,
    payment,
    user,
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(client)),
  };

  return { prisma: client };
});

const app = createApp();

const OWNER_ID = "user_owner_1";
const OTHER_OWNER_ID = "user_owner_2";
const DINER_ID = "user_diner_1";
const ADMIN_ID = "user_admin_1";

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const ownerToken = tokenFor(OWNER_ID, "OWNER");
const otherOwnerToken = tokenFor(OTHER_OWNER_ID, "OWNER");
const dinerToken = tokenFor(DINER_ID, "DINER");
const adminToken = tokenFor(ADMIN_ID, "ADMIN");

const activeRestaurant = {
  id: "rest_1",
  slug: "pho-corner",
  ownerId: OWNER_ID,
  status: "ACTIVE",
  minBookingNotice: 60,
  maxBookingDays: 30,
  minCapacity: 1,
  maxCapacity: 0,
  depositRequired: false,
  depositAmount: "0",
};

// 3 days out is comfortably inside the default 60-minute notice window and
// the default 30-day lookahead, whatever "today" happens to be when the
// suite runs.
const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;
const FUTURE = new Date(Date.now() + 3 * 86_400_000);
FUTURE.setUTCHours(0, 0, 0, 0);
const FUTURE_DATE = FUTURE.toISOString().slice(0, 10);
const FUTURE_DAY_OF_WEEK = DAY_NAMES[FUTURE.getUTCDay()];
const BOOKING_TIME = "18:00";

const openHours = {
  id: "hours_1",
  restaurantId: "rest_1",
  dayOfWeek: FUTURE_DAY_OF_WEEK,
  openTime: "11:00",
  closeTime: "22:00",
  isClosed: false,
};

function futureBody(overrides: Record<string, unknown> = {}) {
  return {
    restaurantId: "rest_1",
    date: FUTURE_DATE,
    time: BOOKING_TIME,
    partySize: 2,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/restaurants/:id/availability", () => {
  it("is unavailable when the restaurant is disabled", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      ...activeRestaurant,
      status: "DISABLED",
    });

    const res = await request(app).get(
      `/api/restaurants/rest_1/availability?date=${FUTURE_DATE}&time=${BOOKING_TIME}&partySize=2`,
    );

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
  });

  it("is unavailable when the restaurant is closed that day", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(activeRestaurant);
    vi.mocked(prisma.operatingHours.findUnique).mockResolvedValueOnce({
      ...openHours,
      isClosed: true,
    });

    const res = await request(app).get(
      `/api/restaurants/rest_1/availability?date=${FUTURE_DATE}&time=${BOOKING_TIME}&partySize=2`,
    );

    expect(res.body.available).toBe(false);
    expect(res.body.reason).toMatch(/closed/i);
  });

  it("is unavailable when every fitting table is already booked", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(activeRestaurant);
    vi.mocked(prisma.operatingHours.findUnique).mockResolvedValueOnce(openHours);
    vi.mocked(prisma.specialClosure.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.restaurantTable.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.restaurantTable.findMany).mockResolvedValueOnce([
      { id: "table_1", capacity: 4 },
    ]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([{ tableId: "table_1" }]);

    const res = await request(app).get(
      `/api/restaurants/rest_1/availability?date=${FUTURE_DATE}&time=${BOOKING_TIME}&partySize=2`,
    );

    expect(res.body.available).toBe(false);
    expect(res.body.reason).toMatch(/fully booked/i);
  });

  it("is available when hours, closures, and tables all check out", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(activeRestaurant);
    vi.mocked(prisma.operatingHours.findUnique).mockResolvedValueOnce(openHours);
    vi.mocked(prisma.specialClosure.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.restaurantTable.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.restaurantTable.findMany).mockResolvedValueOnce([
      { id: "table_1", capacity: 4 },
    ]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);

    const res = await request(app).get(
      `/api/restaurants/rest_1/availability?date=${FUTURE_DATE}&time=${BOOKING_TIME}&partySize=2`,
    );

    expect(res.body.available).toBe(true);
  });
});

describe("POST /api/reservations", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/reservations").send(futureBody());
    expect(res.status).toBe(401);
  });

  it("rejects non-diners", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(futureBody());
    expect(res.status).toBe(403);
  });

  it("returns 409 when the slot isn't available", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue({
      ...activeRestaurant,
      status: "DISABLED",
    });

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send(futureBody());

    expect(res.status).toBe(409);
    expect(prisma.reservation.create).not.toHaveBeenCalled();
  });

  it("books the table and returns a confirmation code", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue(activeRestaurant);
    vi.mocked(prisma.operatingHours.findUnique).mockResolvedValue(openHours);
    vi.mocked(prisma.specialClosure.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.restaurantTable.count).mockResolvedValue(1);
    vi.mocked(prisma.restaurantTable.findMany).mockResolvedValue([
      { id: "table_1", capacity: 4 },
    ]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.reservation.findUnique).mockResolvedValue(null); // confirmation code is free
    vi.mocked(prisma.reservation.create).mockResolvedValueOnce({
      id: "res_1",
      confirmationCode: "TS-1234",
      restaurantId: "rest_1",
      userId: DINER_ID,
      tableId: "table_1",
      status: "PENDING",
    });

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send(futureBody());

    expect(res.status).toBe(201);
    expect(res.body.reservation.confirmationCode).toBe("TS-1234");
    const createArgs = vi.mocked(prisma.reservation.create).mock.calls[0]?.[0];
    expect(createArgs?.data.userId).toBe(DINER_ID);
    expect(createArgs?.data.tableId).toBe("table_1");
  });
});

describe("GET /api/reservations/mine", () => {
  it("only returns the signed-in diner's reservations", async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/api/reservations/mine")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.reservation.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.userId).toBe(DINER_ID);
  });
});

describe("PATCH /api/reservations/:id/cancel", () => {
  it("hides another diner's reservation behind a 404", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: "someone_else",
      status: "PENDING",
    });

    const res = await request(app)
      .patch("/api/reservations/res_1/cancel")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(404);
  });

  it("rejects cancelling an already-completed reservation", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      status: "COMPLETED",
    });

    const res = await request(app)
      .patch("/api/reservations/res_1/cancel")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(409);
  });

  it("cancels the diner's own pending reservation", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      status: "PENDING",
    });
    vi.mocked(prisma.reservation.update).mockResolvedValueOnce({
      id: "res_1",
      status: "CANCELLED",
    });

    const res = await request(app)
      .patch("/api/reservations/res_1/cancel")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.reservation.status).toBe("CANCELLED");
  });
});

describe("POST /api/reservations/manual", () => {
  it("rejects non-owners", async () => {
    const res = await request(app)
      .post("/api/reservations/manual")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send(futureBody({ guestName: "Walk-in", guestPhone: "+85512345678" }));
    expect(res.status).toBe(403);
  });

  it("finds or creates a guest user by phone and books for their own restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue(activeRestaurant);
    vi.mocked(prisma.operatingHours.findUnique).mockResolvedValue(openHours);
    vi.mocked(prisma.specialClosure.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.restaurantTable.count).mockResolvedValue(1);
    vi.mocked(prisma.restaurantTable.findMany).mockResolvedValue([
      { id: "table_1", capacity: 4 },
    ]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.reservation.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: "guest_1", name: "Walk-in" });
    vi.mocked(prisma.reservation.create).mockResolvedValueOnce({
      id: "res_2",
      confirmationCode: "TS-5678",
      status: "CONFIRMED",
    });

    const res = await request(app)
      .post("/api/reservations/manual")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(futureBody({ guestName: "Walk-in", guestPhone: "+85512345678" }));

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledOnce();
    const createArgs = vi.mocked(prisma.reservation.create).mock.calls[0]?.[0];
    expect(createArgs?.data.userId).toBe("guest_1");
    expect(createArgs?.data.status).toBe("CONFIRMED");
  });

  it("rejects booking into a restaurant the owner doesn't own", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(activeRestaurant);

    const res = await request(app)
      .post("/api/reservations/manual")
      .set("Authorization", `Bearer ${otherOwnerToken}`)
      .send(futureBody({ guestName: "Walk-in", guestPhone: "+85512345678" }));

    expect(res.status).toBe(404);
  });
});

describe("GET /api/reservations (owner)", () => {
  it("scopes the query to the owner's own restaurants", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([{ id: "rest_1" }]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.reservation.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.restaurantId).toEqual({ in: ["rest_1"] });
  });
});

describe("PATCH /api/reservations/:id/status", () => {
  it("hides a reservation belonging to another owner's restaurant behind a 404", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      restaurant: { ownerId: OTHER_OWNER_ID },
    });

    const res = await request(app)
      .patch("/api/reservations/res_1/status")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(404);
  });

  it("lets the owner update status on their own restaurant's reservation", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      restaurant: { ownerId: OWNER_ID },
    });
    vi.mocked(prisma.reservation.update).mockResolvedValueOnce({
      id: "res_1",
      status: "CONFIRMED",
    });

    const res = await request(app)
      .patch("/api/reservations/res_1/status")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(200);
    expect(res.body.reservation.status).toBe("CONFIRMED");
  });
});

describe("GET /api/reservations/all", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .get("/api/reservations/all")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin see reservations platform-wide", async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .get("/api/reservations/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe("POST /api/reservations/:id/payment", () => {
  it("rejects a reservation with no deposit due", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      depositAmount: 0,
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(400);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("returns 404 for a reservation that isn't the caller's", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: "someone_else",
      depositAmount: 10,
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(404);
  });

  it("creates a KHQR payment seeded from the reservation's deposit", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      depositAmount: 10,
    });
    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.payment.create).mockResolvedValueOnce({
      id: "pay_1",
      reservationId: "res_1",
      amount: 10,
      status: "PENDING",
      khqrPayload: "KHQR|...",
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.payment.khqrPayload).toContain("KHQR|");
  });

  it("returns the existing payment instead of creating a duplicate", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      depositAmount: 10,
    });
    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: "pay_1",
      reservationId: "res_1",
      status: "PENDING",
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(201);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/reservations/:id/payment/confirm", () => {
  it("returns 404 when there's no payment yet", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
    });
    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/reservations/res_1/payment/confirm")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(404);
  });

  it("marks the payment paid and confirms a pending reservation", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      status: "PENDING",
    });
    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: "pay_1",
      reservationId: "res_1",
      status: "PENDING",
    });
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({
      id: "pay_1",
      reservationId: "res_1",
      status: "PAID",
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment/confirm")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe("PAID");
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: "res_1" },
      data: { depositPaid: true, status: "CONFIRMED" },
    });
  });

  it("is idempotent when the payment is already paid", async () => {
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: "res_1",
      userId: DINER_ID,
      status: "CONFIRMED",
    });
    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: "pay_1",
      reservationId: "res_1",
      status: "PAID",
    });

    const res = await request(app)
      .post("/api/reservations/res_1/payment/confirm")
      .set("Authorization", `Bearer ${dinerToken}`);

    expect(res.status).toBe(200);
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });
});

describe("GET /api/reservations/stats", () => {
  it("rejects non-owners", async () => {
    const res = await request(app)
      .get("/api/reservations/stats")
      .set("Authorization", `Bearer ${dinerToken}`);
    expect(res.status).toBe(403);
  });

  it("returns a zero-filled bucket per day, scoped to the owner's restaurants", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([{ id: "rest_1" }]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([
      { date: new Date() },
      { date: new Date() },
    ]);

    const res = await request(app)
      .get("/api/reservations/stats?days=7")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(7);
    const total = res.body.days.reduce((sum: number, d: { count: number }) => sum + d.count, 0);
    expect(total).toBe(2);
  });
});

describe("GET /api/reservations/stats/all", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .get("/api/reservations/stats/all")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("returns platform-wide daily counts", async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/api/reservations/stats/all?days=14")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(14);
  });
});
