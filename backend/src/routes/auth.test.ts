import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

import { createApp } from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    otpCode: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({ verifyIdToken })),
}));

const app = createApp();

const baseUser = {
  id: "user_1",
  role: "DINER" as const,
  name: "Sokha",
  email: "sokha@example.com",
  phone: null,
  passwordHash: "$2a$12$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ012345",
  googleId: null,
  avatarUrl: null,
  status: "ACTIVE" as const,
  preferredLocale: "km",
  restaurantLimit: 3,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/signup", () => {
  it("rejects a weak/incomplete payload", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(baseUser);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Sokha",
      email: "sokha@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates an account, hashes the password, and returns a token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce(baseUser);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Sokha",
      email: "sokha@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(res.body.user.email).toBe("sokha@example.com");
    expect(typeof res.body.token).toBe("string");

    const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
    expect(createArgs?.data.passwordHash).not.toBe("password123");
  });
});

describe("POST /api/auth/login", () => {
  it("rejects an unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "sokha@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("rejects a suspended account even with the correct password", async () => {
    const bcrypt = await import("bcryptjs");
    const suspended = {
      ...baseUser,
      status: "SUSPENDED" as const,
      passwordHash: await bcrypt.hash("password123", 4),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(suspended);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "sokha@example.com", password: "password123" });

    expect(res.status).toBe(403);
  });

  it("logs in with the correct password", async () => {
    const bcrypt = await import("bcryptjs");
    const user = { ...baseUser, passwordHash: await bcrypt.hash("password123", 4) };
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(user);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "sokha@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(typeof res.body.token).toBe("string");
  });
});

describe("POST /api/auth/google", () => {
  it("creates a new account on first Google login", async () => {
    verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google-sub-1",
        email: "new@example.com",
        name: "New Diner",
        picture: "https://example.com/pic.jpg",
      }),
    });
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce(null); // by email
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      ...baseUser,
      email: "new@example.com",
      googleId: "google-sub-1",
      passwordHash: null,
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "valid-token" });

    expect(res.status).toBe(200);
    expect(res.body.user.googleId).toBe("google-sub-1");
  });

  it("links an existing password account with the same email", async () => {
    verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google-sub-2",
        email: "sokha@example.com",
        name: "Sokha",
      }),
    });
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce(baseUser); // by email
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...baseUser,
      googleId: "google-sub-2",
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "valid-token" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: baseUser.id },
      data: { googleId: "google-sub-2" },
    });
  });

  it("rejects an invalid Google token", async () => {
    verifyIdToken.mockRejectedValueOnce(new Error("bad token"));

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "garbage" });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/otp/request", () => {
  it("rejects a non-Cambodian phone number", async () => {
    const res = await request(app)
      .post("/api/auth/otp/request")
      .send({ phone: "12345" });

    expect(res.status).toBe(400);
    expect(prisma.otpCode.create).not.toHaveBeenCalled();
  });

  it("supersedes any prior code and issues a new one", async () => {
    vi.mocked(prisma.otpCode.updateMany).mockResolvedValueOnce({ count: 1 });
    vi.mocked(prisma.otpCode.create).mockResolvedValueOnce(
      {} as Awaited<ReturnType<typeof prisma.otpCode.create>>,
    );

    const res = await request(app)
      .post("/api/auth/otp/request")
      .send({ phone: "+85512345678" });

    expect(res.status).toBe(200);
    expect(prisma.otpCode.updateMany).toHaveBeenCalledWith({
      where: { phone: "+85512345678", consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    });
    expect(res.body.devCode).toMatch(/^\d{6}$/);
  });
});

describe("POST /api/auth/otp/verify", () => {
  const phone = "+85512345678";

  it("rejects verification when no code was requested", async () => {
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "123456" });

    expect(res.status).toBe(400);
  });

  it("rejects an expired code", async () => {
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce({
      id: "otp_1",
      phone,
      codeHash: "irrelevant",
      attempts: 0,
      expiresAt: new Date(Date.now() - 1000),
      consumedAt: null,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "123456" });

    expect(res.status).toBe(401);
  });

  it("rejects after too many attempts", async () => {
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce({
      id: "otp_1",
      phone,
      codeHash: "irrelevant",
      attempts: 5,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "123456" });

    expect(res.status).toBe(429);
  });

  it("rejects an incorrect code and records the attempt", async () => {
    const bcrypt = await import("bcryptjs");
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce({
      id: "otp_1",
      phone,
      codeHash: await bcrypt.hash("111111", 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "222222" });

    expect(res.status).toBe(401);
    expect(prisma.otpCode.update).toHaveBeenCalledWith({
      where: { id: "otp_1" },
      data: { attempts: { increment: 1 } },
    });
  });

  it("logs in an existing user with the correct code", async () => {
    const bcrypt = await import("bcryptjs");
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce({
      id: "otp_1",
      phone,
      codeHash: await bcrypt.hash("123456", 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      ...baseUser,
      phone,
      email: null,
      passwordHash: null,
    });

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "123456" });

    expect(res.status).toBe(200);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(typeof res.body.token).toBe("string");
  });

  it("creates a new diner on first-time verification", async () => {
    const bcrypt = await import("bcryptjs");
    vi.mocked(prisma.otpCode.findFirst).mockResolvedValueOnce({
      id: "otp_1",
      phone,
      codeHash: await bcrypt.hash("123456", 4),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      ...baseUser,
      phone,
      email: null,
      passwordHash: null,
    });

    const res = await request(app)
      .post("/api/auth/otp/verify")
      .send({ phone, code: "123456" });

    expect(res.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: phone, phone },
    });
  });
});

describe("GET /api/auth/me", () => {
  it("rejects requests without a bearer token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const token = jwt.sign({ sub: baseUser.id, role: baseUser.role }, "test-secret");
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(baseUser);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(baseUser.id);
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("returns 404 if the user backing a valid token was deleted", async () => {
    const token = jwt.sign({ sub: baseUser.id, role: baseUser.role }, "test-secret");
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
