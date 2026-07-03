"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { apiFetch, ApiError, SESSION_ENDED_EVENT } from "@/lib/api";
import type { AuthResponse, AuthUser, OtpRequestResponse, Role } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: Extract<Role, "DINER" | "OWNER">;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  // Set when this session was ended by the server (e.g. the account was
  // suspended) rather than by the user clicking "Log out" — surfaces the
  // server's reason so the affected person knows why they were signed out.
  sessionMessage: string | null;
  clearSessionMessage: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: SignupInput) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  requestOtp: (phone: string) => Promise<OtpRequestResponse>;
  verifyOtp: (phone: string, code: string) => Promise<AuthUser>;
  updateProfile: (input: { name?: string; preferredLocale?: "km" | "en" }) => Promise<AuthUser>;
  logout: () => void;
}

interface CreateAuthContextOptions {
  // Distinct per surface so customer/owner/admin sessions live side by side
  // in the same browser without clobbering each other.
  storageKey: string;
  // When set, only these roles may hold a session on this surface. A login
  // that authenticates fine but comes back with the wrong role is rejected
  // client-side (and the token discarded) with a pointer to the right portal.
  allowedRoles?: Role[];
  wrongRoleMessage?: string;
}

interface AuthContextBundle {
  Provider: ComponentType<{ children: ReactNode }>;
  useAuth: () => AuthContextValue;
}

// Factory for a surface-scoped auth context. Each call produces an isolated
// provider + hook pair with its own localStorage key, so the customer site,
// owner portal, and admin portal each maintain an independent session.
export function createAuthContext(options: CreateAuthContextOptions): AuthContextBundle {
  const { storageKey, allowedRoles, wrongRoleMessage } = options;

  const Context = createContext<AuthContextValue | null>(null);

  function assertAllowedRole(user: AuthUser): void {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw new ApiError(
        403,
        wrongRoleMessage ?? "This account can't sign in here.",
      );
    }
  }

  function Provider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [sessionMessage, setSessionMessage] = useState<string | null>(null);

    // Hydrate from this surface's own stored token on first load, so
    // refreshing the page doesn't sign the user out.
    useEffect(() => {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) {
        setStatus("unauthenticated");
        return;
      }
      apiFetch<{ user: AuthUser }>("/api/auth/me", { token: stored })
        .then((res) => {
          assertAllowedRole(res.user);
          setUser(res.user);
          setToken(stored);
          setStatus("authenticated");
        })
        .catch(() => {
          window.localStorage.removeItem(storageKey);
          setStatus("unauthenticated");
        });
    }, []);

    const applyAuthResponse = useCallback((res: AuthResponse): AuthUser => {
      // Reject before persisting anything, so a wrong-role login leaves no
      // trace on this surface.
      assertAllowedRole(res.user);
      window.localStorage.setItem(storageKey, res.token);
      setUser(res.user);
      setToken(res.token);
      setStatus("authenticated");
      setSessionMessage(null);
      return res.user;
    }, []);

    // A request made with this surface's token came back 401 — most likely
    // an admin suspended the account mid-session. Force a logout and keep
    // the server's reason around so the login screen can show it.
    useEffect(() => {
      function handleSessionEnded(e: Event): void {
        window.localStorage.removeItem(storageKey);
        setUser(null);
        setToken(null);
        setStatus("unauthenticated");
        setSessionMessage((e as CustomEvent<string>).detail ?? null);
      }
      window.addEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
      return () => window.removeEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
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

    const updateProfile = useCallback(
      (input: { name?: string; preferredLocale?: "km" | "en" }) => {
        if (!token) return Promise.reject(new Error("Not authenticated"));
        return apiFetch<{ user: AuthUser }>("/api/auth/me", {
          method: "PATCH",
          body: input,
          token,
        }).then((res) => {
          setUser(res.user);
          return res.user;
        });
      },
      [token],
    );

    const logout = useCallback(() => {
      window.localStorage.removeItem(storageKey);
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
    }, []);

    const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

    const value = useMemo<AuthContextValue>(
      () => ({
        user,
        token,
        status,
        sessionMessage,
        clearSessionMessage,
        login,
        signup,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        updateProfile,
        logout,
      }),
      [
        user,
        token,
        status,
        sessionMessage,
        clearSessionMessage,
        login,
        signup,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        updateProfile,
        logout,
      ],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useAuth(): AuthContextValue {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(`useAuth for "${storageKey}" must be used within its Provider`);
    }
    return ctx;
  }

  return { Provider, useAuth };
}
