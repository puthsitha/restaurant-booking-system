export type PaymentMethodBrand = "ABA" | "WING" | "BAKONG" | "ACLEDA";

export interface PaymentMethod {
  id: string;
  brand: PaymentMethodBrand;
  label: string;
  detail: string | null;
  isDefault: boolean;
  createdAt: string;
}
