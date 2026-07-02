import { apiFetch } from "@/lib/api";
import type {
  ListRestaurantRequestsParams,
  ListRestaurantRequestsResponse,
  RequestStatus,
  RestaurantRequest,
} from "@/lib/requests/types";

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export interface CreateRestaurantRequestInput {
  requestedCount: number;
  reason: string;
}

export function createRestaurantRequest(
  input: CreateRestaurantRequestInput,
  token: string,
): Promise<{ request: RestaurantRequest }> {
  return apiFetch("/api/restaurant-requests", { method: "POST", body: input, token });
}

export function listMyRestaurantRequests(
  token: string,
): Promise<{ requests: RestaurantRequest[] }> {
  return apiFetch("/api/restaurant-requests/mine", { token });
}

export function listAllRestaurantRequests(
  params: ListRestaurantRequestsParams,
  token: string,
): Promise<ListRestaurantRequestsResponse> {
  return apiFetch(
    `/api/restaurant-requests${toQueryString(params as Record<string, string | number | undefined>)}`,
    { token },
  );
}

export interface ReviewRestaurantRequestInput {
  status: Extract<RequestStatus, "APPROVED" | "DENIED">;
  reviewNote: string;
}

export function reviewRestaurantRequest(
  id: string,
  input: ReviewRestaurantRequestInput,
  token: string,
): Promise<{ request: RestaurantRequest }> {
  return apiFetch(`/api/restaurant-requests/${id}/review`, {
    method: "PATCH",
    body: input,
    token,
  });
}
