import { apiFetch } from "@/lib/api/client";
import type { Service } from "@/features/services/types";

type ServicesResponse = {
	services: Service[];
};

export async function getServices(): Promise<Service[]> {
	const res = await apiFetch("/api/services");

	if (!res.ok) {
		throw new Error("Không thể tải danh sách dịch vụ.");
	}

	const data = (await res.json()) as ServicesResponse;
	return data.services;
}
