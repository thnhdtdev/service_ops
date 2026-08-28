import type { User } from "@supabase/supabase-js";
import { UserRole } from "./auth";

declare module "fastify" {
  interface FastifyRequest {
    user: User;
    accessToken: string;
    role: UserRole
  }
}

export {};