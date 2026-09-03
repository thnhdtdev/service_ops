import { apiFetch } from "@/lib/api/client";

import type { GetOrdersParams, GetOrdersResponse } from "@/features/orders/type";

export async function getOrders(params: GetOrdersParams = {}): Promise<GetOrdersResponse> {
	const searchParams = new URLSearchParams();

	if (params.page) {
		searchParams.set("page", String(params.page));
	}

	if (params.pageSize) {
		searchParams.set("page_size", String(params.pageSize));
	}

	if (params.status) {
		searchParams.set("status", params.status);
	}

	if (params.paymentStatus) {
		searchParams.set("payment_status", params.paymentStatus);
	}

	const queryString = searchParams.toString();

	const url = queryString ? `/api/orders?${queryString}` : "/api/orders";

	let response: Response;

	try {
		response = await apiFetch(url);
	} catch {
		throw new Error("Không thể tải danh sách đơn hàng.");
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
		}

		throw new Error("Không thể tải danh sách đơn hàng.");
	}

	try {
		return (await response.json()) as GetOrdersResponse;
	} catch {
		throw new Error("Không thể tải danh sách đơn hàng.");
	}
}
