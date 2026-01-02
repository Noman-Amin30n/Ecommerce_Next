import { z } from "zod";

// Regex for validating URLs (basic pattern)
const urlPattern = /^https?:\/\/.+/;

export const CreateReviewSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().max(200, "Title must be at most 200 characters").optional(),
  body: z.string().max(2000, "Body must be at most 2000 characters").optional(),
  images: z
    .array(z.string().regex(urlPattern, "Invalid image URL"))
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
  title: z.string().max(200, "Title must be at most 200 characters").optional(),
  body: z.string().max(2000, "Body must be at most 2000 characters").optional(),
  images: z
    .array(z.string().regex(urlPattern, "Invalid image URL"))
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
