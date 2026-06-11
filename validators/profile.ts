import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya huruf, angka, dan underscore"),
  bio: z.string().max(160, "Bio maksimal 160 karakter").optional(),
  website: z.string().url("URL tidak valid").optional().or(z.literal("")),
  location: z.string().max(50, "Lokasi maksimal 50 karakter").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
