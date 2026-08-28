import type { ServiceUnit } from "@/constants/service-unit";
import type { Service } from "@/features/services/types";
import { apiFetch } from "@/lib/api/client";

export type UpdateServiceInput = {
	name?: string;
	unit?: ServiceUnit;
	unit_price?: number;
	description?: string | null;
	is_active?: boolean;
};

type UpdateServiceResponse = {
	service: Service;
};

type ErrorResponse = {
	message?: string;
};

export async function updateService(id: string, input: UpdateServiceInput): Promise<Service> {
	const response = await apiFetch(`/api/services/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input)
	});

	const data = (await response.json().catch(() => null)) as
		| UpdateServiceResponse
		| ErrorResponse
		| null;

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error("Bạn không có quyền cập nhật dịch vụ.");
		}

		if (response.status === 404) {
			throw new Error("Dịch vụ không còn tồn tại.");
		}

		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể cập nhật dịch vụ.");
	}

	return (data as UpdateServiceResponse).service;
}
