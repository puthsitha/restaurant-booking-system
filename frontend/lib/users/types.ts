export type ManageableRole = "DINER" | "OWNER";
export type UserAccountStatus = "ACTIVE" | "SUSPENDED";

export interface ManagedUser {
  id: string;
  role: ManageableRole;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: UserAccountStatus;
  statusReason: string | null;
  restaurantLimit: number;
  createdAt: string;
}

export interface ListUsersResponse {
  items: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUsersParams {
  role?: ManageableRole;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateOwnerInput {
  name: string;
  email: string;
  password: string;
  restaurantLimit?: number;
}
