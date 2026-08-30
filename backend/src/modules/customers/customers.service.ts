import { error } from "node:console";
import { createUserSupabase, supabase } from "../../lib/supabase.js";
import { normalizePhone } from "./customers.utils.js";
import { create } from "node:domain";

type FindOrCreateCustomerInput  = {
  name: string,
  phone: string,
  address?: string | null,
  note?: string | null
}

export async function findOrCreateCustomer(
  accessToken: string, 
  input:FindOrCreateCustomerInput
) {
  const supabase = createUserSupabase(accessToken);
  const normalizedPhone = normalizePhone(input.phone);

  //1. Find existing customers
  const {data: existingCustomer, error: findError} = 
    await supabase
    .from("customers")
    .select(`
      id,
      name,
      phone,
      address,
      normalized_phone,
      created_at, 
      updated_at`)
      .eq("normalized", normalizePhone)
      .maybeSingle();

       if (findError) {
        throw findError;
      }

      // 2. Customer exists → reuse, DO NOT INSERT
      if(existingCustomer){
        return {
          customer: existingCustomer,
          created: false
        }
      }

      // 3. Not found → create new customer
      const {data: newCustomer, error: createError} = 
      await supabase
      .from("customers")
      .insert({
        name: input.name,
        phone: input.phone,
        normalized_phone: normalizePhone,
        address: input.address ?? null,
        note: input.note ?? null
      })
      .select(`
        id,
        name,
        phone,
        address,
        normalized_phone,
        note,
        created_at,
        updated_at`)
        .single()

        if(createError){
          throw createError
        }

        return{
          customer: newCustomer,
          created: true
        }
}


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