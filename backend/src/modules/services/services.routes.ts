import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	getServices,
	createService,
	updateService
} from "./services.service.js";

import {
	createSchemaService,
	serviceParamsSchema,
	updateServiceSchema
} from "./services.schema.js";

export async function servicesRoutes(
	app: FastifyInstance
) {
	// GET /api/services
	app.get<{
		Querystring: {
			active?: string;
		};
	}>(
		"/",
		{
			preHandler: requireAuth
		},
		async (request) => {
			const activeOnly =
				request.query.active === "true";

			const services =
				await getServices(
					request.accessToken,
					activeOnly
				);

			return {
				services
			};
		}
	);

	// POST /api/services
	app.post(
		"/",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				createSchemaService.safeParse(
					request.body
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid request body",
						errors:
							result.error.flatten()
					});
			}

			const service =
				await createService(
					request.accessToken,
					result.data
				);

			return reply
				.status(201)
				.send({
					service
				});
		}
	);

	// PATCH /api/services/:id
	app.patch<{
		Params: {
			id: string;
		};
	}>(
		"/:id",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			// 1. Validate UUID trên URL
			const paramsResult =
				serviceParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid service ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			// 2. Validate body
			const bodyResult =
				updateServiceSchema.safeParse(
					request.body
				);

			if (!bodyResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid request body",
						errors:
							bodyResult.error.flatten()
					});
			}

			// 3. Chỉ gọi database sau khi
			// params + body đều hợp lệ
			const service =
				await updateService(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (!service) {
				return reply
					.status(404)
					.send({
						message:
							"Service not found"
					});
			}

			return reply
				.status(200)
				.send({
					service
				});
		}
	);
}