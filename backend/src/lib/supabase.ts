import {env} from "../config/env.js"
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession:false, //no persisting of session in local storage
            autoRefreshToken: false,
        },
    },
);

export function createUserSupabase(accessToken: string) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );
}