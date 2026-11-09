import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	getDashboardStats,
	getRevenueChartData,
	getServiceMixData
} from "./dashboard.service.js";
import { toStaffDashboardStats } from "./dashboard.utils.js";

export async function dashboardRoutes(
	app: FastifyInstance
) {
	app.get(
		"/stats",
		{
			preHandler: requireAuth
		},
		async (request, reply) => {
			const data =
				await getDashboardStats(
					request.accessToken
				);

			// Staff only get order counts, money stays admin-only.
			return reply.send(
				request.role === "admin"
					? data
					: toStaffDashboardStats(data)
			);
		}
	);

    // Admin only: shows revenue per service.
    app.get(
	"/service-mix",
	{
		preHandler: [
			requireAuth,
			requireRole("admin")
		]
	},
	async (request, reply) => {
		const data =
			await getServiceMixData(
				request.accessToken
			);

		return reply.send(data);
	}
    );

    // Admin only: daily revenue.
    app.get(
	"/revenue-chart",
	{
		preHandler: [
			requireAuth,
			requireRole("admin")
		]
	},
	async (request, reply) => {
		const data =
			await getRevenueChartData(
				request.accessToken
			);

		return reply.send(data);
	}
);
}