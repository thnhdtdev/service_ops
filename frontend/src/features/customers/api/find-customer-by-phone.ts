import { apiFetch } from "@/lib/api/client";

import type { CustomerSummary } from "@/features/customers/types";

type CustomerLookupResponse = {
	customer: CustomerSummary | null;
};

export async function findCustomerByPhone(
	phone: string
): Promise<CustomerSummary | null> {
	const trimmedPhone = phone.trim();

	if (!trimmedPhone) {
		return null;
	}

	const searchParams = new URLSearchParams({
		phone: trimmedPhone
	});

	let response: Response;

	try {
		response = await apiFetch(
			`/api/customers/lookup?${searchParams.toString()}`
		);
	} catch {
		throw new Error(
			"Không thể kiểm tra thông tin khách hàng."
		);
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error(
				"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
			);
		}

		throw new Error(
			"Không thể kiểm tra thông tin khách hàng."
		);
	}

	try {
		const data =
			(await response.json()) as CustomerLookupResponse;

		return data.customer;
	} catch {
		throw new Error(
			"Không thể đọc thông tin khách hàng."
		);
	}
}