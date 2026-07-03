import { apiFetch } from "@/lib/api";
import type { PaymentMethod, PaymentMethodBrand } from "@/lib/paymentMethods/types";

export function listPaymentMethods(token: string): Promise<{ paymentMethods: PaymentMethod[] }> {
  return apiFetch("/api/payment-methods", { token });
}

export interface CreatePaymentMethodInput {
  brand: PaymentMethodBrand;
  label: string;
  detail?: string;
  isDefault?: boolean;
}

export function createPaymentMethod(
  input: CreatePaymentMethodInput,
  token: string,
): Promise<{ paymentMethod: PaymentMethod }> {
  return apiFetch("/api/payment-methods", { method: "POST", body: input, token });
}

export function deletePaymentMethod(id: string, token: string): Promise<void> {
  return apiFetch(`/api/payment-methods/${id}`, { method: "DELETE", token });
}

export function setDefaultPaymentMethod(
  id: string,
  token: string,
): Promise<{ paymentMethod: PaymentMethod }> {
  return apiFetch(`/api/payment-methods/${id}/default`, { method: "PATCH", token });
}
