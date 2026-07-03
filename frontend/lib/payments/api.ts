import { apiFetch } from "@/lib/api";
import type { Payment } from "@/lib/payments/types";

export function createPayment(reservationId: string, token: string): Promise<{ payment: Payment }> {
  return apiFetch(`/api/reservations/${reservationId}/payment`, { method: "POST", token });
}

export function confirmPayment(reservationId: string, token: string): Promise<{ payment: Payment }> {
  return apiFetch(`/api/reservations/${reservationId}/payment/confirm`, {
    method: "POST",
    token,
  });
}
