import { resolve } from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);