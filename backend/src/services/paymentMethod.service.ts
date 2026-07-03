import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import type { CreatePaymentMethodInput } from "../schemas/paymentMethod.schemas";

export async function listPaymentMethods(userId: string) {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createPaymentMethod(userId: string, input: CreatePaymentMethodInput) {
  if (input.isDefault) {
    await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.paymentMethod.create({
    data: { userId, ...input },
  });
}

export async function deletePaymentMethod(userId: string, id: string): Promise<void> {
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method || method.userId !== userId) {
    throw new HttpError(404, "Payment method not found");
  }
  await prisma.paymentMethod.delete({ where: { id } });
}

export async function setDefaultPaymentMethod(userId: string, id: string) {
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method || method.userId !== userId) {
    throw new HttpError(404, "Payment method not found");
  }
  await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
  return prisma.paymentMethod.update({ where: { id }, data: { isDefault: true } });
}
