import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/features/services/types";

export async function getActiveServices(): Promise<Service[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, name, unit, unit_price, description, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Không thể tải danh sách dịch vụ.");
  }

  return (data ?? []) as Service[];
}