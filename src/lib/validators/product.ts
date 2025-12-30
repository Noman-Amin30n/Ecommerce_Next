import { z } from "zod";

const handleNumeric = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || (typeof val === "number" && isNaN(val)) ? undefined : val),
    schema
  );

export const SizeVariantSchema = z.object({
  size: z.string().min(1),
  sku: z.string().min(1),
  price: handleNumeric(z.coerce.number().min(0)),
  compareAtPrice: handleNumeric(z.coerce.number().min(0).optional()),
  quantity: handleNumeric(z.coerce.number().int().min(0).optional()),
});

export const VariantSchema = z.object({
  color: z.object({
    label: z.string().min(1),
    value: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  images: z.array(z.string().url()).optional(),
  sku: z.string().optional(),
  price: handleNumeric(z.coerce.number().min(0).optional()),
  compareAtPrice: handleNumeric(z.coerce.number().min(0).optional()),
  quantity: handleNumeric(z.coerce.number().int().min(0).optional()),
  sizes: z.array(SizeVariantSchema).optional(),
});

export const ProductCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: handleNumeric(z.coerce.number().min(0)),
  compareAtPrice: handleNumeric(z.coerce.number().min(0).optional()),
  currency: z.string().min(3).optional(),
  category: z.string().min(1), // ObjectId string
  images: z.array(z.string().url()).optional(),
  variants: z.array(VariantSchema).optional(),
  tags: z.array(z.string()).optional(),
  colors: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().regex(/^#[0-9A-F]{6}$/i),
      })
    )
    .optional(),
  sizes: z.array(z.string()).optional(),
  sku: z.string().optional(),
  quantity: handleNumeric(z.coerce.number().int().min(0).optional()),
  isPublished: z.boolean().optional(),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
