import { apiFetch } from "@/lib/api/client";

import type {
	PaymentMethod
} from "@/constants/payment-method";

export async function addOrderPayment(
	orderId: string,
	amount: number,
	paymentMethod: PaymentMethod
) {
	let response: Response;

	try {
		response = await apiFetch(
			`/api/orders/${orderId}/payments`,
			{
				method: "POST",
				body: JSON.stringify({
					amount,
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

		if (response.status === 400) {
			throw new Error(
				"Khoản thanh toán không hợp lệ."
			);
		}

		throw new Error(
			"Không thể ghi nhận thanh toán."
		);
	}

	return response.json();
}