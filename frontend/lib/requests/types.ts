export type RequestStatus = "PENDING" | "APPROVED" | "DENIED";

export interface RestaurantRequestOwner {
  id: string;
  name: string;
  email: string | null;
  restaurantLimit: number;
}

export interface RestaurantRequestReviewer {
  id: string;
  name: string;
}

export interface RestaurantRequest {
  id: string;
  ownerId: string;
  owner: RestaurantRequestOwner;
  currentCount: number;
  requestedCount: number;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  reviewedById: string | null;
  reviewedBy: RestaurantRequestReviewer | null;
}

export interface ListRestaurantRequestsResponse {
  items: RestaurantRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListRestaurantRequestsParams {
  status?: RequestStatus;
  page?: number;
  pageSize?: number;
}
