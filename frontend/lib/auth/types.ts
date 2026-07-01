export type Role = "DINER" | "OWNER" | "ADMIN";

// Mirrors the backend's PublicUser (backend/src/services/auth.service.ts),
// i.e. a User row with passwordHash stripped out.
export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED";
  preferredLocale: string;
  restaurantLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface OtpRequestResponse {
  message: string;
  devCode?: string;
}
