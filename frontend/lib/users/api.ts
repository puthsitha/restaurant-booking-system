import { apiFetch } from "@/lib/api";
import type {
  CreateOwnerInput,
  ListUsersParams,
  ListUsersResponse,
  ManagedUser,
  UserAccountStatus,
} from "@/lib/users/types";

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listUsers(params: ListUsersParams, token: string): Promise<ListUsersResponse> {
  return apiFetch(
    `/api/users${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

export function createOwner(
  input: CreateOwnerInput,
  token: string,
): Promise<{ user: ManagedUser }> {
  return apiFetch("/api/users", { method: "POST", body: input, token });
}

export function updateUserStatus(
  id: string,
  status: UserAccountStatus,
  reason: string,
  token: string,
): Promise<{ user: ManagedUser }> {
  return apiFetch(`/api/users/${id}/status`, {
    method: "PATCH",
    body: { status, reason },
    token,
  });
}
