import { z } from "zod";

export const createUrlSchema = z.object({
  longUrl: z.string().url(),
  customAlias: z.string().min(3).max(100).regex(/^[a-zA-Z0-9\/\-]+$/, "Only letters, numbers, slashes, and hyphens are allowed").optional()
});
