import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	createStaffMemberSchema,
	staffMemberParamsSchema,
	updateStaffMemberSchema
} from "./staff-members.schema.js";

import {
	createStaffMember,
	createStaffMemberLink,
	disableStaffMemberLink,
	getStaffMembers,
	updateStaffMember
} from "./staff-members.service.js";

export async function staffMembersRoutes(
	app: FastifyInstance
) {
	// GET /api/staff-members
	app.get(
		"/",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request) => {
			const staffMembers =
				await getStaffMembers(
					request.accessToken
				);

			return {
				staff_members: staffMembers
			};
		}
	);

	// POST /api/staff-members
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
				createStaffMemberSchema.safeParse(
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

			const staffMember =
				await createStaffMember(
					request.accessToken,
					result.data
				);

			return reply
				.status(201)
				.send({
					staff_member: staffMember
				});
		}
	);

	// PATCH /api/staff-members/:id
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
				staffMemberParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid staff member ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			const bodyResult =
				updateStaffMemberSchema.safeParse(
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

			const staffMember =
				await updateStaffMember(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (!staffMember) {
				return reply
					.status(404)
					.send({
						message:
							"Staff member not found"
					});
			}

			return reply.send({
				staff_member: staffMember
			});
		}
	);

	// POST /api/staff-members/:id/link
	// Creates or replaces the personal link. The token is only shown here.
	app.post(
		"/:id/link",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				staffMemberParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid staff member ID",
						errors:
							result.error.flatten()
					});
			}

			const link =
				await createStaffMemberLink(
					request.accessToken,
					result.data.id
				);

			if (!link) {
				return reply
					.status(404)
					.send({
						message:
							"Không tìm thấy nhân viên hoặc nhân viên đã ngừng hoạt động."
					});
			}

			return reply
				.status(201)
				.header("Cache-Control", "no-store")
				.send(link);
		}
	);

	// DELETE /api/staff-members/:id/link
	app.delete(
		"/:id/link",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				staffMemberParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid staff member ID",
						errors:
							result.error.flatten()
					});
			}

			const staffMember =
				await disableStaffMemberLink(
					request.accessToken,
					result.data.id
				);

			if (!staffMember) {
				return reply
					.status(404)
					.send({
						message:
							"Staff member not found"
					});
			}

			return reply.send({
				staff_member: staffMember
			});
		}
	);
}
