import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parent: z.string().optional(),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
