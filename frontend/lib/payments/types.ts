export type PaymentChannel = "KHQR" | "ABA" | "WING" | "BAKONG" | "ACLEDA";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  reservationId: string;
  channel: PaymentChannel;
  amount: string;
  currency: string;
  status: PaymentStatus;
  khqrPayload: string | null;
  paidAt: string | null;
  createdAt: string;
}
