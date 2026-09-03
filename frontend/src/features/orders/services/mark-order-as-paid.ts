import { apiFetch } from "@/lib/api/client";

import type {
	PaymentMethod
} from "@/constants/payment-method";

export async function markOrderAsPaid(
	orderId: string,
	paymentMethod: PaymentMethod
) {
	let response: Response;

	try {
		response = await apiFetch(
			`/api/orders/${orderId}/mark-paid`,
			{
				method: "POST",
				body: JSON.stringify({
					payment_method:
						paymentMethod
				})
			}
		);
	} catch {
		throw new Error(
			"Không thể ghi nhận thanh toán."
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
			"Không thể ghi nhận thanh toán."
		);
	}

	return response.json();
}