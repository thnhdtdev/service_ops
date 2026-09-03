import { apiFetch } from "@/lib/api/client";

import type { GetCustomersParams, GetCustomersResponse } from "@/features/customers/types";

export async function getCustomers(params: GetCustomersParams = {}): Promise<GetCustomersResponse> {
	const searchParams = new URLSearchParams();

	if (params.page) {
		searchParams.set("page", String(params.page));
	}

	if (params.pageSize) {
		searchParams.set("page_size", String(params.pageSize));
	}

	if (params.search) {
		searchParams.set("search", params.search);
	}

	const queryString = searchParams.toString();

	const url = queryString ? `/api/customers?${queryString}` : "/api/customers";

	let response: Response;

	try {
		response = await apiFetch(url);
	} catch {
		throw new Error("Không thể tải danh sách khách hàng.");
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
		}

		throw new Error("Không thể tải danh sách khách hàng.");
	}

	try {
		return (await response.json()) as GetCustomersResponse;
	} catch {
		throw new Error("Không thể đọc danh sách khách hàng.");
	}
}
