import { createUserSupabase } from "../../lib/supabase";

export async function getServices(
  accessToken: string,
  activeOnly = false,
) {
  const supabase = createUserSupabase(accessToken);

  let query = supabase
    .from("services")
    .select(`
      id,
      name,
      unit,
      unit_price,
      description,
      is_active,
      created_at,
      updated_at
    `);

    //service active = true
  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("name", {
    ascending: true,
  });

  if (error) {
    throw error;
  }

  return data ?? [];
}