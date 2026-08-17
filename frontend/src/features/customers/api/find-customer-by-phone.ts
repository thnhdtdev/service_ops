import { createClient } from "@/lib/supabase/client";
import type { CustomerSummary } from "@/features/customers/types";
import { getCustomerPhoneLookupValues } from "@/features/customers/utils/normalize-customer-phone";

export async function findCustomerByPhone(phone: string): Promise<CustomerSummary | null> {
	const lookupValues = getCustomerPhoneLookupValues(phone);

	if (lookupValues.length === 0) {
		return null;
	}

	const supabase = createClient();
	const { data, error } = await supabase
		.from("customers")
		.select("id, name, phone")
		.in("phone", lookupValues)
		.limit(1)
		.maybeSingle();

	if (error) {
		throw new Error("Không thể kiểm tra thông tin khách hàng.");
	}

	return data as CustomerSummary | null;
}
