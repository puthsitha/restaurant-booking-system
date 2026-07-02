"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { apiFetch } from "@/lib/api";
import type { AuthResponse, AuthUser, OtpRequestResponse, Role } from "@/lib/auth/types";

const TOKEN_STORAGE_KEY = "tablesite.token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: Extract<Role, "DINER" | "OWNER">;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: SignupInput) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  requestOtp: (phone: string) => Promise<OtpRequestResponse>;
  verifyOtp: (phone: string, code: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Hydrate from a previously stored token on first load, so refreshing the
  // page doesn't sign the user out.
  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    apiFetch<{ user: AuthUser }>("/api/auth/me", { token: stored })
      .then((res) => {
        setUser(res.user);
        setToken(stored);
        setStatus("authenticated");
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setStatus("unauthenticated");
      });
  }, []);

  const applyAuthResponse = useCallback((res: AuthResponse): AuthUser => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
    setToken(res.token);
    setStatus("authenticated");
    return res.user;
  }, []);

  const login = useCallback(
    (email: string, password: string) =>
      apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      }).then(applyAuthResponse),
    [applyAuthResponse],
  );

  const signup = useCallback(
    (input: SignupInput) =>
      apiFetch<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: input,
      }).then(applyAuthResponse),
    [applyAuthResponse],
  );

  const loginWithGoogle = useCallback(
    (idToken: string) =>
      apiFetch<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: { idToken },
      }).then(applyAuthResponse),
    [applyAuthResponse],
  );

  const requestOtp = useCallback(
    (phone: string) =>
      apiFetch<OtpRequestResponse>("/api/auth/otp/request", {
        method: "POST",
        body: { phone },
      }),
    [],
  );

  const verifyOtp = useCallback(
    (phone: string, code: string) =>
      apiFetch<AuthResponse>("/api/auth/otp/verify", {
        method: "POST",
        body: { phone, code },
      }).then(applyAuthResponse),
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      login,
      signup,
      loginWithGoogle,
      requestOtp,
      verifyOtp,
      logout,
    }),
    [user, token, status, login, signup, loginWithGoogle, requestOtp, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
