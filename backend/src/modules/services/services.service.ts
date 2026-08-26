import { createUserSupabase } from "../../lib/supabase";

export async function getServices (accessToken: string)
{
    const supabase = createUserSupabase(accessToken)
    const {data, error} = await supabase.from("services").select(
        `id,
        name,
        unit,
        unit_price,
        description,
        is_active,
        created_at,
        updated_at`
    ).order("name", {
        ascending:true
    });

    if(error){
        throw error
    }

    return data ?? []
}