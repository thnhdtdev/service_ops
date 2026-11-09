import { apiFetch } from "@/lib/api/client";

import type { CustomerSuggestion } from "@/features/customers/types";

type SuggestCustomersResponse = {
	customers: CustomerSuggestion[];
};

// Quick search by name, phone digits or both, e.g. "yen 202".
export async function suggestCustomers(query: string): Promise<CustomerSuggestion[]> {
	const searchParams = new URLSearchParams({ q: query });

	let response: Response;

	try {
		response = await apiFetch(`/api/customers/suggest?${searchParams.toString()}`);
	} catch {
		throw new Error("Không thể tìm khách hàng.");
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
		}

		throw new Error("Không thể tìm khách hàng.");
	}

	try {
		const data = (await response.json()) as SuggestCustomersResponse;

		return data.customers;
	} catch {
		throw new Error("Không thể đọc danh sách khách hàng.");
	}
}
