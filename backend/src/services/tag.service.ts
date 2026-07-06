import type { Tag } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { localizeTags, type Locale } from "../lib/locale";
import type { CreateTagInput, UpdateTagInput } from "../schemas/tag.schemas";

export async function listTags(locale: Locale): Promise<Omit<Tag, "nameKm">[]> {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return localizeTags(tags, locale);
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const existing = await prisma.tag.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new HttpError(409, `Tag "${input.name}" already exists`);
  }
  return prisma.tag.create({ data: input });
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new HttpError(404, "Tag not found");
  }
  if (input.name && input.name !== tag.name) {
    const existing = await prisma.tag.findUnique({ where: { name: input.name } });
    if (existing) {
      throw new HttpError(409, `Tag "${input.name}" already exists`);
    }
  }
  return prisma.tag.update({ where: { id }, data: input });
}

export async function deleteTag(id: string): Promise<void> {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new HttpError(404, "Tag not found");
  }
  await prisma.tag.delete({ where: { id } });
}
