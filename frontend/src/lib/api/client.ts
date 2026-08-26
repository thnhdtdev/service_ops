import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return response;
}