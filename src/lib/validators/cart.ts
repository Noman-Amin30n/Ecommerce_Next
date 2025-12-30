// src/lib/validators/cart.ts
import { z } from "zod";

export const CartItemSchema = z.object({
  product: z.string().min(1),
  variantSku: z.string().optional(),
  image: z.string().optional(),
  color: z
    .object({
      label: z.string().min(1),
      value: z.string().regex(/^#[0-9A-F]{6}$/i),
    })
    .optional(),
  size: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const UpdateCartSchema = z.object({
  items: z.array(CartItemSchema),
});

export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;