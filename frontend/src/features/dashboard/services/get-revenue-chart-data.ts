import { connection } from "next/server";

import { serverApiFetch } from "@/lib/api/server";
import type { RevenueChartData } from "@/features/dashboard/types";

export type RevenueChartResult = {
	data: RevenueChartData;
	error: string | null;
};

function createEmptyData(): RevenueChartData {
	return {
		week: [],
		month: []
	};
}

export async function getRevenueChartData(): Promise<RevenueChartResult> {
	await connection();

	try {
		const response = await serverApiFetch("/api/dashboard/revenue-chart");

		if (!response.ok) {
			return {
				data: createEmptyData(),
				error: "Không thể tải dữ liệu doanh thu. Vui lòng thử lại."
			};
		}

		const data = (await response.json()) as RevenueChartData;

		return {
			data,
			error: null
		};
	} catch (error) {
		console.error("Dashboard revenue chart error:", error);

		return {
			data: createEmptyData(),
			error: "Không thể tải dữ liệu doanh thu. Vui lòng thử lại."
		};
	}
}
