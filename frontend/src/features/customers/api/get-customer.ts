import { apiFetch } from "@/lib/api/client";

import type {
	GetCustomerResponse
} from "@/features/customers/types";

export async function getCustomer(
	customerId: string
): Promise<GetCustomerResponse> {
	let response: Response;

	try {
		response = await apiFetch(
			`/api/customers/${customerId}`
		);
	} catch {
		throw new Error(
			"Không thể tải thông tin khách hàng."
		);
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error(
				"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
			);
		}

		if (response.status === 404) {
			throw new Error(
				"Không tìm thấy khách hàng."
			);
		}

		throw new Error(
			"Không thể tải thông tin khách hàng."
		);
	}

	try {
		return (
			(await response.json()) as GetCustomerResponse
		);
	} catch {
		throw new Error(
			"Không thể đọc thông tin khách hàng."
		);
	}
}