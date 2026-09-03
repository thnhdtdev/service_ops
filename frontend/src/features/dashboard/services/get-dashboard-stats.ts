import { connection } from "next/server";

import type {
	DashboardStats
} from "@/features/dashboard/types";

import {
	serverApiFetch
} from "@/lib/api/server";

export async function getDashboardStats():
	Promise<DashboardStats> {
	await connection();

	let response: Response;

	try {
		response = await serverApiFetch(
			"/api/dashboard/stats"
		);
	} catch {
		throw new Error(
			"Không thể tải thống kê tổng quan."
		);
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error(
				"Phiên đăng nhập đã hết hạn."
			);
		}

		throw new Error(
			"Không thể tải thống kê tổng quan."
		);
	}

	try {
		return (
			(await response.json()) as DashboardStats
		);
	} catch {
		throw new Error(
			"Không thể đọc dữ liệu thống kê."
		);
	}
}