import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	createScheduleWeekSchema,
	createShiftAssignmentSchema,
	createShiftSchema,
	scheduleWeekParamsSchema,
	shiftAssignmentParamsSchema,
	shiftParamsSchema,
	updateScheduleWeekSchema
} from "./schedules.schema.js";

import {
	createScheduleWeek,
	createShift,
	createShiftAssignment,
	deleteShift,
	deleteShiftAssignment,
	getScheduleWeekDetail,
	getScheduleWeeks,
	updateScheduleWeek
} from "./schedules.service.js";

// Registered with prefix "/api" because it serves both
// /api/schedule-weeks/... and /api/shifts/...
export async function schedulesRoutes(
	app: FastifyInstance
) {
	// GET /api/schedule-weeks
	app.get(
		"/schedule-weeks",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request) => {
			const scheduleWeeks =
				await getScheduleWeeks(
					request.accessToken
				);

			return {
				schedule_weeks: scheduleWeeks
			};
		}
	);

	// POST /api/schedule-weeks
	app.post(
		"/schedule-weeks",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				createScheduleWeekSchema.safeParse(
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

			const data =
				await createScheduleWeek(
					request.accessToken,
					result.data
				);

			if (data.status === "conflict") {
				return reply
					.status(409)
					.send({
						message:
							"Tuần này đã tồn tại hoặc đang có một tuần khác mở nhận lịch bận."
					});
			}

			return reply
				.status(201)
				.send({
					schedule_week: data.week
				});
		}
	);

	// GET /api/schedule-weeks/:id
	app.get(
		"/schedule-weeks/:id",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				scheduleWeekParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid schedule week ID",
						errors:
							result.error.flatten()
					});
			}

			const data =
				await getScheduleWeekDetail(
					request.accessToken,
					result.data.id
				);

			if (!data) {
				return reply
					.status(404)
					.send({
						message:
							"Schedule week not found"
					});
			}

			return reply.send(data);
		}
	);

	// PATCH /api/schedule-weeks/:id
	// Change the deadline, publish (status: "published") or re-open.
	app.patch(
		"/schedule-weeks/:id",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const paramsResult =
				scheduleWeekParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid schedule week ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			const bodyResult =
				updateScheduleWeekSchema.safeParse(
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

			const data =
				await updateScheduleWeek(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (data.status === "not_found") {
				return reply
					.status(404)
					.send({
						message:
							"Schedule week not found"
					});
			}

			if (data.status === "conflict") {
				return reply
					.status(409)
					.send({
						message:
							"Đang có một tuần khác mở nhận lịch bận."
					});
			}

			return reply.send({
				schedule_week: data.week
			});
		}
	);

	// POST /api/schedule-weeks/:id/shifts
	app.post(
		"/schedule-weeks/:id/shifts",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const paramsResult =
				scheduleWeekParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid schedule week ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			const bodyResult =
				createShiftSchema.safeParse(
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

			const data =
				await createShift(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (data.status === "not_found") {
				return reply
					.status(404)
					.send({
						message:
							"Schedule week not found"
					});
			}

			if (data.status === "invalid_date") {
				return reply
					.status(400)
					.send({
						message:
							"Ngày của ca phải nằm trong tuần."
					});
			}

			return reply
				.status(201)
				.send({
					shift: data.shift
				});
		}
	);

	// DELETE /api/shifts/:id
	app.delete(
		"/shifts/:id",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				shiftParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid shift ID",
						errors:
							result.error.flatten()
					});
			}

			const shift =
				await deleteShift(
					request.accessToken,
					result.data.id
				);

			if (!shift) {
				return reply
					.status(404)
					.send({
						message:
							"Shift not found"
					});
			}

			return reply
				.status(204)
				.send();
		}
	);

	// POST /api/shifts/:id/assignments
	app.post(
		"/shifts/:id/assignments",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const paramsResult =
				shiftParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid shift ID",
						errors:
							paramsResult.error.flatten()
					});
			}

			const bodyResult =
				createShiftAssignmentSchema.safeParse(
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

			const data =
				await createShiftAssignment(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data.staff_member_id
				);

			if (data.status === "shift_not_found") {
				return reply
					.status(404)
					.send({
						message:
							"Shift not found"
					});
			}

			if (data.status === "staff_not_found") {
				return reply
					.status(404)
					.send({
						message:
							"Không tìm thấy nhân viên hoặc nhân viên đã ngừng hoạt động."
					});
			}

			if (data.status === "already_assigned") {
				return reply
					.status(409)
					.send({
						message:
							"Nhân viên đã được xếp vào ca này."
					});
			}

			return reply
				.status(201)
				.send({
					warnings: data.warnings
				});
		}
	);

	// DELETE /api/shifts/:id/assignments/:staffMemberId
	app.delete(
		"/shifts/:id/assignments/:staffMemberId",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				shiftAssignmentParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid assignment",
						errors:
							result.error.flatten()
					});
			}

			const assignment =
				await deleteShiftAssignment(
					request.accessToken,
					result.data.id,
					result.data.staffMemberId
				);

			if (!assignment) {
				return reply
					.status(404)
					.send({
						message:
							"Assignment not found"
					});
			}

			return reply
				.status(204)
				.send();
		}
	);
}
