import { createUserSupabase } from "../../lib/supabase.js";
import { normalizePhone } from "./customers.utils.js";

export async function findCustomerByPhone(
  accessToken: string,
  phone: string,
) {
  const supabase = createUserSupabase(accessToken);

  const normalizedPhone = normalizePhone(phone);

  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      name,
      phone,
      normalized_phone,
      address,
      note,
      created_at,
      updated_at
    `)
    .eq("normalized_phone", normalizedPhone)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}