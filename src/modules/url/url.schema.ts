import { z } from "zod";

export const createUrlSchema = z.object({
  longUrl: z.string().url(),
  customAlias: z.string().min(4).max(10).optional()
});
