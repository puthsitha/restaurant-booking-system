import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(1000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const replyToReviewSchema = z.object({
  reply: z.string().trim().min(1).max(1000),
});
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;

export const updateReviewSchema = createReviewSchema;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
