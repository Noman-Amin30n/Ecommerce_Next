import { z } from "zod";

export const AddressSchema = z.object({
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
});

export const OnboardingSchema = z.object({
  address: AddressSchema,
  image: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5mb")
    .refine(
      (f) => ["image/png", "image/jpeg", "image/webp"].includes(f.type),
      "Invalid format"
    )
    .optional(),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
