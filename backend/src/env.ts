import dotenv from "dotenv";

// Load .env once, as early as possible. Importing this module is the single
// entry point for configuration; everything else reads the typed `env` object.
dotenv.config();

type NodeEnv = "development" | "test" | "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy backend/.env.example to backend/.env and fill it in.`,
    );
  }
  return value;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }
  return parsed;
}

const nodeEnv = (process.env.NODE_ENV as NodeEnv | undefined) ?? "development";

// Validated, typed application configuration. Reading a missing required value
// throws here at startup (fail fast) instead of surfacing as a runtime 500.
export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: intEnv("PORT", 4000),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  // Comma-separated allowlist of browser origins permitted to call the API.
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: intEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    max: intEnv("RATE_LIMIT_MAX", 100),
  },
  // Maximum accepted JSON request body size.
  jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? "100kb",
} as const;

export type Env = typeof env;
