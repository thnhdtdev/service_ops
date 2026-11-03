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
  // Web Push (VAPID) keys, created with: npx web-push generate-vapid-keys
  // The private key stays in the backend; the public key is sent to the browser.
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  // Contact for the push services. Apple only accepts mailto: or https:.
  VAPID_SUBJECT: z
    .string()
    .regex(/^(mailto:|https:\/\/)/, "VAPID_SUBJECT must start with mailto: or https://"),
});

export const env = envSchema.parse(process.env);