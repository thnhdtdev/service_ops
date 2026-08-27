import { createUserSupabase, supabase } from "../../lib/supabase";
export type CreateServiceInput = {
  name: string,
  unit: string,
  unit_price: number,
  description?: string | null
}

export type UpdateService = {
  name: string,
  unit: string,
  unit_price: number,
  description?: string | null,
  is_active?: boolean

}

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

export async function createService(
  accessToken: string,
  input: CreateServiceInput 
){
  const supabase = createUserSupabase(accessToken);

  const {data, error} = await supabase
  .from("services")
  .insert({
    name: input.name,
    unit: input.unit,
    unit_price: input.unit_price,
    description: input.description ?? null,
    is_active: true,
  })
  .select(`
    id,
    name,
    unit,
    unit_price,
    description,
    is_active,
    created_at,
    updated_at`)
    .single()

    if(error){
      throw error;
    }

    return data;
}

export async function updateService(
  accessToken: string,
  id: string,
  input: UpdateService
){

  const supabase = createUserSupabase(accessToken);


  const {data, error} = await supabase
  .from("services")
  .update(input)
  .eq("id", id)
  .select(`
    id,
    name,
    unit,
    unit_price,
    description,
    is_active,
    created_at,
    updated_at`)
    .single()


    if(error){
      throw error
    }

    return data;
}