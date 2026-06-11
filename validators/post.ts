import { z } from "zod";

export const createPostSchema = z.object({
  caption: z.string().max(2200, "Caption maksimal 2200 karakter").optional(),
  mediaUrls: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string(),
        type: z.enum(["IMAGE", "VIDEO"]),
        width: z.number().optional(),
        height: z.number().optional(),
        duration: z.number().optional(),
        order: z.number(),
      })
    )
    .max(10, "Maksimal 10 media per postingan"),
});

export const editPostSchema = z.object({
  caption: z.string().max(2200, "Caption maksimal 2200 karakter").optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Komentar tidak boleh kosong")
    .max(500, "Komentar maksimal 500 karakter"),
});

export const reportSchema = z.object({
  reason: z.enum([
    "SPAM", "HARASSMENT", "HATE_SPEECH", "VIOLENCE",
    "NUDITY", "MISINFORMATION", "OTHER",
  ]),
  description: z.string().max(500).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type EditPostInput = z.infer<typeof editPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
