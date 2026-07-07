import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const restaurant = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const operatingHours = {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
  };
  const restaurantTable = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const menu = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const menuItem = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const galleryImage = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const specialClosure = {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const tag = {
    findUnique: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const user = {
    findUnique: vi.fn(),
    // Used by the `authenticate` middleware to check the token subject is
    // still active; defaults to "found and active" so existing tests don't
    // need to stub it, and is overridden per-test to simulate suspension.
    findFirst: vi.fn().mockResolvedValue({ status: "ACTIVE", statusReason: null }),
  };

  const client = {
    restaurant,
    operatingHours,
    restaurantTable,
    menu,
    menuItem,
    galleryImage,
    specialClosure,
    tag,
    user,
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(client)),
  };

  return { prisma: client };
});

const app = createApp();

const OWNER_ID = "user_owner_1";
const OTHER_OWNER_ID = "user_owner_2";
const ADMIN_ID = "user_admin_1";

function tokenFor(sub: string, role: string): string {
  return jwt.sign({ sub, role }, "test-secret");
}

const ownerToken = tokenFor(OWNER_ID, "OWNER");
const otherOwnerToken = tokenFor(OTHER_OWNER_ID, "OWNER");
const adminToken = tokenFor(ADMIN_ID, "ADMIN");
const dinerToken = tokenFor("user_diner_1", "DINER");

const baseRestaurant = {
  id: "rest_1",
  slug: "pho-corner",
  name: "Pho Corner",
  nameKm: null,
  description: null,
  descriptionKm: null,
  cuisineType: "Vietnamese",
  address: "123 St",
  city: "Phnom Penh",
  state: null,
  country: "Cambodia",
  postalCode: null,
  phone: null,
  email: null,
  website: null,
  coverImageUrl: null,
  latitude: null,
  longitude: null,
  priceRange: "MEDIUM",
  isPopular: false,
  status: "ACTIVE",
  minBookingNotice: 60,
  maxBookingDays: 30,
  cancellationHours: 24,
  depositRequired: false,
  depositAmount: "0",
  maxCapacity: 0,
  minCapacity: 1,
  parkingAvailable: false,
  dressCode: null,
  ownerId: OWNER_ID,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  tags: [],
  menus: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/restaurants", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/restaurants").send({});
    expect(res.status).toBe(401);
  });

  it("rejects diners", async () => {
    const res = await request(app)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${dinerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it("rejects once the owner's restaurant limit is reached", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 1,
    });
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Pho Corner",
        slug: "pho-corner",
        cuisineType: "Vietnamese",
        address: "123 St",
        city: "Phnom Penh",
      });

    expect(res.status).toBe(403);
    expect(prisma.restaurant.create).not.toHaveBeenCalled();
  });

  it("rejects a slug that's already taken", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 3,
    });
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Pho Corner",
        slug: "pho-corner",
        cuisineType: "Vietnamese",
        address: "123 St",
        city: "Phnom Penh",
      });

    expect(res.status).toBe(409);
  });

  it("creates a restaurant for the signed-in owner", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: OWNER_ID,
      restaurantLimit: 3,
    });
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.restaurant.create).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Pho Corner",
        slug: "pho-corner",
        cuisineType: "Vietnamese",
        address: "123 St",
        city: "Phnom Penh",
      });

    expect(res.status).toBe(201);
    expect(res.body.restaurant.slug).toBe("pho-corner");
    const createArgs = vi.mocked(prisma.restaurant.create).mock.calls[0]?.[0];
    expect(createArgs?.data.ownerId).toBe(OWNER_ID);
    expect(createArgs?.data.status).toBe("PENDING");
  });
});

describe("GET /api/restaurants/mine", () => {
  it("scopes to the signed-in owner and paginates", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([baseRestaurant]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .get("/api/restaurants/mine")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    const whereArg = vi.mocked(prisma.restaurant.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.ownerId).toBe(OWNER_ID);
  });

  it("filters by name search and status", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(0);

    const res = await request(app)
      .get("/api/restaurants/mine?search=pho&status=PENDING")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.restaurant.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.status).toBe("PENDING");
    expect(whereArg?.name).toEqual({ contains: "pho", mode: "insensitive" });
  });
});

describe("GET /api/restaurants", () => {
  it("only returns active restaurants and rejects an invalid priceRange filter", async () => {
    const res = await request(app).get("/api/restaurants?priceRange=NOT_A_TIER");
    expect(res.status).toBe(400);
  });

  it("lists active restaurants with pagination", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([baseRestaurant]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app).get("/api/restaurants?city=Phnom%20Penh");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items).toHaveLength(1);
    const whereArg = vi.mocked(prisma.restaurant.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.status).toBe("ACTIVE");
  });

  it("returns the English name/description by default", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([
      { ...baseRestaurant, name: "Pho Corner", nameKm: "ផូកន័រ", description: "Great pho", descriptionKm: "ផ្សេងទៀត" },
    ]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app).get("/api/restaurants");

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe("Pho Corner");
    expect(res.body.items[0].description).toBe("Great pho");
  });

  it("computes distanceKm from the client's coordinate headers", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([
      { ...baseRestaurant, latitude: "13.3671", longitude: "103.8448" }, // Siem Reap
    ]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .get("/api/restaurants")
      .set("X-Client-Lat", "11.5564")
      .set("X-Client-Lng", "104.9282"); // Phnom Penh

    expect(res.status).toBe(200);
    expect(res.body.items[0].distanceKm).toBeGreaterThan(230);
    expect(res.body.items[0].distanceKm).toBeLessThan(280);
  });

  it("returns a null distanceKm when the restaurant has no coordinates on file", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([baseRestaurant]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app).get("/api/restaurants");

    expect(res.status).toBe(200);
    expect(res.body.items[0].distanceKm).toBeNull();
  });

  it("returns the Khmer name/description when Accept-Language is km", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([
      { ...baseRestaurant, name: "Pho Corner", nameKm: "ផូកន័រ", description: "Great pho", descriptionKm: "ម្ហូបផូឆ្ងាញ់" },
    ]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app).get("/api/restaurants").set("Accept-Language", "km");

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe("ផូកន័រ");
    expect(res.body.items[0].description).toBe("ម្ហូបផូឆ្ងាញ់");
  });

  it("falls back to the English name/description when Khmer isn't set", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([baseRestaurant]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app).get("/api/restaurants").set("Accept-Language", "km");

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe(baseRestaurant.name);
  });
});

describe("GET /api/restaurants/slug/:slug", () => {
  it("returns 404 for a disabled restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      ...baseRestaurant,
      status: "DISABLED",
    });

    const res = await request(app).get("/api/restaurants/slug/pho-corner");
    expect(res.status).toBe(404);
  });

  it("returns the public detail for an active restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app).get("/api/restaurants/slug/pho-corner");
    expect(res.status).toBe(200);
    expect(res.body.restaurant.slug).toBe("pho-corner");
  });

  it("returns the Khmer name/description when Accept-Language is km", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      ...baseRestaurant,
      nameKm: "ផូកន័រ",
      descriptionKm: "ម្ហូបផូឆ្ងាញ់",
    });

    const res = await request(app)
      .get("/api/restaurants/slug/pho-corner")
      .set("Accept-Language", "km");

    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe("ផូកន័រ");
    expect(res.body.restaurant.description).toBe("ម្ហូបផូឆ្ងាញ់");
  });

  it("localizes the Khmer address and menu/item names when Accept-Language is km", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      ...baseRestaurant,
      address: "123 St",
      addressKm: "ផ្លូវលេខ ១២៣",
      menus: [
        {
          id: "menu_1",
          name: "Lunch Menu",
          nameKm: "ម៉ឺនុយថ្ងៃត្រង់",
          description: null,
          descriptionKm: null,
          items: [
            {
              id: "item_1",
              name: "Fish Amok",
              nameKm: "អាម៉ុកត្រី",
              description: "Steamed fish curry",
              descriptionKm: "ត្រីចំហុយ",
            },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/restaurants/slug/pho-corner")
      .set("Accept-Language", "km");

    expect(res.status).toBe(200);
    expect(res.body.restaurant.address).toBe("ផ្លូវលេខ ១២៣");
    expect(res.body.restaurant.menus[0].name).toBe("ម៉ឺនុយថ្ងៃត្រង់");
    expect(res.body.restaurant.menus[0].items[0].name).toBe("អាម៉ុកត្រី");
    expect(res.body.restaurant.menus[0].items[0].description).toBe("ត្រីចំហុយ");
  });
});

describe("GET /api/restaurants/all", () => {
  it("rejects non-admins", async () => {
    const res = await request(app)
      .get("/api/restaurants/all")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin see disabled restaurants too", async () => {
    vi.mocked(prisma.restaurant.findMany).mockResolvedValueOnce([
      { ...baseRestaurant, status: "DISABLED" },
    ]);
    vi.mocked(prisma.restaurant.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .get("/api/restaurants/all?status=DISABLED")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const whereArg = vi.mocked(prisma.restaurant.findMany).mock.calls[0]?.[0]?.where;
    expect(whereArg?.status).toBe("DISABLED");
  });
});

describe("GET /api/restaurants/:id (management)", () => {
  it("hides another owner's restaurant behind a 404", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .get("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${otherOwnerToken}`);

    expect(res.status).toBe(404);
  });

  it("lets an admin view any restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .get("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("lets the owner view their own restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .get("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/restaurants/:id", () => {
  it("rejects an owner editing a restaurant they don't own", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .patch("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${otherOwnerToken}`)
      .send({ name: "New name" });

    expect(res.status).toBe(404);
    expect(prisma.restaurant.update).not.toHaveBeenCalled();
  });

  it("rejects admins on the owner-only update route", async () => {
    const res = await request(app)
      .patch("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "New name" });

    expect(res.status).toBe(403);
  });

  it("updates the restaurant for its owner", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.restaurant.update).mockResolvedValueOnce({
      ...baseRestaurant,
      name: "New name",
    });

    const res = await request(app)
      .patch("/api/restaurants/rest_1")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "New name" });

    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe("New name");
  });
});

describe("PATCH /api/restaurants/:id/status", () => {
  it("rejects owners", async () => {
    const res = await request(app)
      .patch("/api/restaurants/rest_1/status")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "DISABLED", reason: "Menu photos looked stale" });

    expect(res.status).toBe(403);
  });

  it("requires a reason", async () => {
    const res = await request(app)
      .patch("/api/restaurants/rest_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DISABLED" });

    expect(res.status).toBe(400);
    expect(prisma.restaurant.update).not.toHaveBeenCalled();
  });

  it("rejects PENDING as a target status — only ACTIVE/DISABLED are admin-settable", async () => {
    const res = await request(app)
      .patch("/api/restaurants/rest_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PENDING", reason: "Just created" });

    expect(res.status).toBe(400);
  });

  it("lets an admin approve a pending restaurant with a reason", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce({
      ...baseRestaurant,
      status: "PENDING",
    });
    vi.mocked(prisma.restaurant.update).mockResolvedValueOnce({
      ...baseRestaurant,
      status: "ACTIVE",
      statusReason: "Looks great, welcome aboard!",
    });

    const res = await request(app)
      .patch("/api/restaurants/rest_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ACTIVE", reason: "Looks great, welcome aboard!" });

    expect(res.status).toBe(200);
    expect(res.body.restaurant.status).toBe("ACTIVE");
    expect(res.body.restaurant.statusReason).toBe("Looks great, welcome aboard!");
    expect(vi.mocked(prisma.restaurant.update).mock.calls[0]?.[0]?.data).toEqual({
      status: "ACTIVE",
      statusReason: "Looks great, welcome aboard!",
    });
  });

  it("lets an admin disable any restaurant with a reason", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.restaurant.update).mockResolvedValueOnce({
      ...baseRestaurant,
      status: "DISABLED",
      statusReason: "Repeated customer complaints",
    });

    const res = await request(app)
      .patch("/api/restaurants/rest_1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DISABLED", reason: "Repeated customer complaints" });

    expect(res.status).toBe(200);
    expect(res.body.restaurant.status).toBe("DISABLED");
    expect(res.body.restaurant.statusReason).toBe("Repeated customer complaints");
  });
});

describe("PUT /api/restaurants/:id/hours", () => {
  it("replaces the week's hours for the owner", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.operatingHours.findMany).mockResolvedValueOnce([
      { id: "h1", restaurantId: "rest_1", dayOfWeek: "MONDAY", openTime: "09:00", closeTime: "21:00", isClosed: false },
    ]);

    const res = await request(app)
      .put("/api/restaurants/rest_1/hours")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ hours: [{ dayOfWeek: "MONDAY", openTime: "09:00", closeTime: "21:00" }] });

    expect(res.status).toBe(200);
    expect(prisma.operatingHours.deleteMany).toHaveBeenCalledWith({
      where: { restaurantId: "rest_1" },
    });
    expect(res.body.hours).toHaveLength(1);
  });

  it("rejects duplicate days in the same request", async () => {
    const res = await request(app)
      .put("/api/restaurants/rest_1/hours")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        hours: [
          { dayOfWeek: "MONDAY", openTime: "09:00", closeTime: "21:00" },
          { dayOfWeek: "MONDAY", openTime: "10:00", closeTime: "20:00" },
        ],
      });

    expect(res.status).toBe(400);
  });
});

describe("Tables", () => {
  it("prevents creating a duplicate table number", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.restaurantTable.findUnique).mockResolvedValueOnce({
      id: "table_1",
      restaurantId: "rest_1",
      tableNumber: "T1",
      capacity: 4,
      floor: null,
      zone: null,
      description: null,
      status: "AVAILABLE",
    });

    const res = await request(app)
      .post("/api/restaurants/rest_1/tables")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ tableNumber: "T1", capacity: 4 });

    expect(res.status).toBe(409);
  });

  it("creates a table for the owner", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.restaurantTable.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.restaurantTable.create).mockResolvedValueOnce({
      id: "table_1",
      restaurantId: "rest_1",
      tableNumber: "T1",
      capacity: 4,
      floor: null,
      zone: null,
      description: null,
      status: "AVAILABLE",
    });

    const res = await request(app)
      .post("/api/restaurants/rest_1/tables")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ tableNumber: "T1", capacity: 4 });

    expect(res.status).toBe(201);
    expect(res.body.table.tableNumber).toBe("T1");
  });

  it("hides another owner's tables behind a 404", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);

    const res = await request(app)
      .get("/api/restaurants/rest_1/tables")
      .set("Authorization", `Bearer ${otherOwnerToken}`);

    expect(res.status).toBe(404);
  });
});

describe("Menus and menu items", () => {
  it("creates a menu, then an item on that menu", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue(baseRestaurant);
    vi.mocked(prisma.menu.create).mockResolvedValueOnce({
      id: "menu_1",
      restaurantId: "rest_1",
      name: "Dinner",
      description: null,
      isActive: true,
      sortOrder: 0,
    });

    const menuRes = await request(app)
      .post("/api/restaurants/rest_1/menus")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Dinner" });
    expect(menuRes.status).toBe(201);

    vi.mocked(prisma.menu.findUnique).mockResolvedValueOnce({
      id: "menu_1",
      restaurantId: "rest_1",
      name: "Dinner",
      description: null,
      isActive: true,
      sortOrder: 0,
    });
    vi.mocked(prisma.menuItem.create).mockResolvedValueOnce({
      id: "item_1",
      menuId: "menu_1",
      name: "Beef Pho",
      description: null,
      price: "8.50",
      category: null,
      imageUrl: null,
      isAvailable: true,
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      sortOrder: 0,
    });

    const itemRes = await request(app)
      .post("/api/restaurants/rest_1/menus/menu_1/items")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Beef Pho", price: 8.5 });

    expect(itemRes.status).toBe(201);
    expect(itemRes.body.item.name).toBe("Beef Pho");
  });

  it("404s when the item's menu doesn't belong to the restaurant", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.menu.findUnique).mockResolvedValueOnce({
      id: "menu_1",
      restaurantId: "some_other_restaurant",
      name: "Dinner",
      description: null,
      isActive: true,
      sortOrder: 0,
    });

    const res = await request(app)
      .post("/api/restaurants/rest_1/menus/menu_1/items")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Beef Pho", price: 8.5 });

    expect(res.status).toBe(404);
  });
});

describe("Gallery and closures", () => {
  it("adds a gallery image", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.galleryImage.create).mockResolvedValueOnce({
      id: "img_1",
      restaurantId: "rest_1",
      url: "https://example.com/a.jpg",
      caption: null,
      sortOrder: 0,
    });

    const res = await request(app)
      .post("/api/restaurants/rest_1/gallery")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ url: "https://example.com/a.jpg" });

    expect(res.status).toBe(201);
  });

  it("prevents a duplicate closure date", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.specialClosure.findUnique).mockResolvedValueOnce({
      id: "closure_1",
      restaurantId: "rest_1",
      date: new Date("2026-12-25"),
      reason: "Holiday",
    });

    const res = await request(app)
      .post("/api/restaurants/rest_1/closures")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ date: "2026-12-25" });

    expect(res.status).toBe(409);
  });
});

describe("PUT /api/restaurants/:id/tags", () => {
  it("rejects tag ids that don't exist", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.tag.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .put("/api/restaurants/rest_1/tags")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ tagIds: ["tag_1", "tag_2"] });

    expect(res.status).toBe(400);
  });

  it("sets the restaurant's tags", async () => {
    vi.mocked(prisma.restaurant.findUnique).mockResolvedValueOnce(baseRestaurant);
    vi.mocked(prisma.tag.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.restaurant.update).mockResolvedValueOnce({
      ...baseRestaurant,
      tags: [
        { id: "tag_1", name: "Family friendly" },
        { id: "tag_2", name: "Vegan" },
      ],
    });

    const res = await request(app)
      .put("/api/restaurants/rest_1/tags")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ tagIds: ["tag_1", "tag_2"] });

    expect(res.status).toBe(200);
    expect(res.body.restaurant.tags).toHaveLength(2);
  });
});

describe("Tags", () => {
  it("lists tags publicly", async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValueOnce([{ id: "tag_1", name: "Vegan" }]);
    const res = await request(app).get("/api/tags");
    expect(res.status).toBe(200);
    expect(res.body.tags).toHaveLength(1);
  });

  it("returns the Khmer tag name when Accept-Language is km", async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValueOnce([
      { id: "tag_1", name: "Vegan", nameKm: "អាហារបួស" },
    ]);
    const res = await request(app).get("/api/tags").set("Accept-Language", "km");
    expect(res.status).toBe(200);
    expect(res.body.tags[0].name).toBe("អាហារបួស");
  });

  it("rejects a non-admin creating a tag", async () => {
    const res = await request(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Vegan" });
    expect(res.status).toBe(403);
  });

  it("rejects a duplicate tag name", async () => {
    vi.mocked(prisma.tag.findUnique).mockResolvedValueOnce({ id: "tag_1", name: "Vegan" });
    const res = await request(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Vegan" });
    expect(res.status).toBe(409);
  });

  it("lets an admin create a tag", async () => {
    vi.mocked(prisma.tag.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.tag.create).mockResolvedValueOnce({ id: "tag_1", name: "Vegan" });
    const res = await request(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Vegan" });
    expect(res.status).toBe(201);
  });

  it("lets an admin delete a tag", async () => {
    vi.mocked(prisma.tag.findUnique).mockResolvedValueOnce({ id: "tag_1", name: "Vegan" });
    const res = await request(app)
      .delete("/api/tags/tag_1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it("rejects a non-admin updating a tag", async () => {
    const res = await request(app)
      .patch("/api/tags/tag_1")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ nameKm: "អាហារបួស" });
    expect(res.status).toBe(403);
  });

  it("404s when updating a tag that doesn't exist", async () => {
    vi.mocked(prisma.tag.findUnique).mockResolvedValueOnce(null);
    const res = await request(app)
      .patch("/api/tags/tag_missing")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nameKm: "អាហារបួស" });
    expect(res.status).toBe(404);
  });

  it("lets an admin add a Khmer name to an existing tag", async () => {
    vi.mocked(prisma.tag.findUnique).mockResolvedValueOnce({ id: "tag_1", name: "Vegan", nameKm: null });
    vi.mocked(prisma.tag.update).mockResolvedValueOnce({
      id: "tag_1",
      name: "Vegan",
      nameKm: "អាហារបួស",
    });
    const res = await request(app)
      .patch("/api/tags/tag_1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nameKm: "អាហារបួស" });
    expect(res.status).toBe(200);
    expect(res.body.tag.nameKm).toBe("អាហារបួស");
  });
});
