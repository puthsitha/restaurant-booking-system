import type { Tag } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import type { CreateTagInput } from "../schemas/tag.schemas";

export async function listTags(): Promise<Tag[]> {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const existing = await prisma.tag.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new HttpError(409, `Tag "${input.name}" already exists`);
  }
  return prisma.tag.create({ data: input });
}

export async function deleteTag(id: string): Promise<void> {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new HttpError(404, "Tag not found");
  }
  await prisma.tag.delete({ where: { id } });
}
