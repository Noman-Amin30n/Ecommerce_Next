import { z } from "zod";

export const VariantSchema = z.object({
  sku: z.string().min(1),
  title: z.string().optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  images: z.array(z.url()).optional(),
  quantity: z.number().int().nonnegative().optional(),
});

export const ProductCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().min(3).optional(),
  category: z.string().min(1), // ObjectId string
  images: z.array(z.url()).optional(),
  variants: z.array(VariantSchema).optional(),
  tags: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().optional(),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
