import type { ServiceMixData } from "@/features/dashboard/types";

import { serverApiFetch } from "@/lib/api/server";

export type ServiceMixResult = {
	data: ServiceMixData;
	error: string | null;
};

function createEmptyData(): ServiceMixData {
	return {
		week: {
			revenue: [],
			selections: []
		},
		month: {
			revenue: [],
			selections: []
		}
	};
}

export async function getServiceMixData(): Promise<ServiceMixResult> {
	try {
		const response = await serverApiFetch("/api/dashboard/service-mix");

		if (!response.ok) {
			return {
				data: createEmptyData(),
				error: "Không thể tải dữ liệu cơ cấu dịch vụ. Vui lòng thử lại."
			};
		}

		const data = (await response.json()) as ServiceMixData;

		return {
			data,
			error: null
		};
	} catch (error) {
		console.error("Dashboard service mix error:", error);

		return {
			data: createEmptyData(),
			error: "Không thể tải dữ liệu cơ cấu dịch vụ. Vui lòng thử lại."
		};
	}
}
