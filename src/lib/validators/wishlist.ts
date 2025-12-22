import { z } from "zod";

export const WishlistAddSchema = z.object({
  product: z.string().min(1), // ObjectId as string
});

export type WishlistAddInput = z.infer<typeof WishlistAddSchema>;