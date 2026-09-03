import { apiFetch } from "@/lib/api/client";

import type { GetOrderResponse } from "@/features/orders/type";

export async function getOrder(
	orderId: string
): Promise<GetOrderResponse> {
	let response: Response;

	try {
		response = await apiFetch(
			`/api/orders/${orderId}`
		);
	} catch {
		throw new Error(
			"Không thể tải thông tin đơn hàng."
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
				"Không tìm thấy đơn hàng."
			);
		}

		throw new Error(
			"Không thể tải thông tin đơn hàng."
		);
	}

	try {
		return (await response.json()) as GetOrderResponse;
	} catch {
		throw new Error(
			"Không thể đọc thông tin đơn hàng."
		);
	}
}