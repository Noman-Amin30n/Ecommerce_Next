import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
  addresses: z
    .array(
      z.object({
        label: z.string().optional(),
        fullName: z.string().min(1),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;