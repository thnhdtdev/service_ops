import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	createShiftTemplateSchema,
	shiftTemplateParamsSchema,
	updateShiftTemplateSchema
} from "./shift-templates.schema.js";

import {
	createShiftTemplate,
	getShiftTemplates,
	updateShiftTemplate
} from "./shift-templates.service.js";

export async function shiftTemplatesRoutes(
	app: FastifyInstance
) {
	// GET /api/shift-templates
	app.get(
		"/",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request) => {
			const shiftTemplates =
				await getShiftTemplates(
					request.accessToken
				);

			return {
				shift_templates: shiftTemplates
			};
		}
	);

	// POST /api/shift-templates
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
				createShiftTemplateSchema.safeParse(
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

			const shiftTemplate =
				await createShiftTemplate(
					request.accessToken,
					result.data
				);

			return reply
				.status(201)
				.send({
					shift_template: shiftTemplate
				});
		}
	);

	// PATCH /api/shift-templates/:id
	app.patch(
		"/:id",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const paramsResult =
				shiftTemplateParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid shift template ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			const bodyResult =
				updateShiftTemplateSchema.safeParse(
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

			const shiftTemplate =
				await updateShiftTemplate(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (!shiftTemplate) {
				return reply
					.status(404)
					.send({
						message:
							"Shift template not found"
					});
			}

			return reply.send({
				shift_template: shiftTemplate
			});
		}
	);
}
