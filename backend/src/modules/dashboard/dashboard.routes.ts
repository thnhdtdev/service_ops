import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";

import {
	getDashboardStats,
	getRevenueChartData,
	getServiceMixData
} from "./dashboard.service.js";

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

			return reply.send(data);
		}
	);

    app.get(
	"/service-mix",
	{
		preHandler: requireAuth
	},
	async (request, reply) => {
		const data =
			await getServiceMixData(
				request.accessToken
			);

		return reply.send(data);
	}
    );

    app.get(
	"/revenue-chart",
	{
		preHandler: requireAuth
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