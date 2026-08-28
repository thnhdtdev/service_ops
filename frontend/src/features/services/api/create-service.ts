import type { ServiceUnit } from "@/constants/service-unit";
import type { Service } from "@/features/services/types";
import { apiFetch } from "@/lib/api/client";

export type CreateServiceInput = {
	name: string;
	unit: ServiceUnit;
	unit_price: number;
	description?: string | null;
};

type CreateServiceResponse = {
	service: Service;
};

type ErrorResponse = {
	message?: string;
};

export async function createService(input: CreateServiceInput): Promise<Service> {
	const res = await apiFetch("/api/services", {
		method: "POST",
		body: JSON.stringify(input)
	});

	const data = (await res.json().catch(() => null)) as
		| CreateServiceResponse
		| ErrorResponse
		| null;

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Bạn không có quyền tạo dịch vụ.");
		}

		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể tạo dịch vụ.");
	}

	return (data as CreateServiceResponse).service;
}
