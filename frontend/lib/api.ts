const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

// Fired whenever an authenticated request (one sent with a token) comes back
// 401 — most notably when an admin suspends the account mid-session. Each
// auth context listens for this to force a client-side logout and surface
// the server's reason, rather than leaving the stale session usable until
// its next explicit request fails silently in some page-local try/catch.
export const SESSION_ENDED_EVENT = "tablesite:session-ended";

function extractErrorMessage(data: unknown, status: number): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return `Request failed with status ${status}`;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    // Restaurant data changes via owner/admin actions with no revalidation
    // wired up, so opt every request out of Next.js's fetch cache — both
    // its Server Component data cache and the browser's HTTP cache.
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message = extractErrorMessage(data, res.status);
    if (res.status === 401 && options.token && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<string>(SESSION_ENDED_EVENT, { detail: message }));
    }
    throw new ApiError(res.status, message);
  }

  return data as T;
}
