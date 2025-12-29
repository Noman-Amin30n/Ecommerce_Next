import { z } from "zod";

export const OrderItemSchema = z.object({
  product: z.string().min(1),
  title: z.string().min(1),
  variantSku: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  currency: z.string().min(3).optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
