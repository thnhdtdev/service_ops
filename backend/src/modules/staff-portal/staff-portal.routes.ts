import type { FastifyInstance, FastifyRequest } from "fastify";

import {
	saveBusyTimesSchema,
	staffPortalTokenSchema
} from "./staff-portal.schema.js";

import {
	getStaffPortal,
	saveStaffBusyTimes
} from "./staff-portal.service.js";

// Same message for a missing, malformed, wrong or disabled link,
// so the response does not reveal which one it was.
const INVALID_LINK_MESSAGE =
	"Link không hợp lệ hoặc đã bị vô hiệu hóa.";

// The token is sent in a header, not in the URL, because Fastify logs
// request URLs.
function readStaffToken(request: FastifyRequest) {
	const result = staffPortalTokenSchema.safeParse(
		request.headers["x-staff-token"]
	);

	return result.success ? result.data : null;
}

// Public routes (no login): access is by the staff member's link token.
export async function staffPortalRoutes(
	app: FastifyInstance
) {
	// Only applies to the routes in this file.
	app.addHook("onRequest", async (_request, reply) => {
		reply.header("Cache-Control", "no-store");
		reply.header("Referrer-Policy", "no-referrer");
	});

	// GET /api/staff-portal
	app.get(
		"/",
		{
			config: {
				rateLimit: {
					max: 30,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const token = readStaffToken(request);

			if (!token) {
				return reply
					.status(404)
					.send({
						message: INVALID_LINK_MESSAGE
					});
			}

			const data = await getStaffPortal(token);

			if (data.status === "invalid_token") {
				return reply
					.status(404)
					.send({
						message: INVALID_LINK_MESSAGE
					});
			}

			return reply.send(data);
		}
	);

	// PUT /api/staff-portal/busy-times
	// Replaces the staff member's busy times for the open week.
	app.put(
		"/busy-times",
		{
			config: {
				rateLimit: {
					max: 10,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const token = readStaffToken(request);

			if (!token) {
				return reply
					.status(404)
					.send({
						message: INVALID_LINK_MESSAGE
					});
			}

			const result =
				saveBusyTimesSchema.safeParse(
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

			const data = await saveStaffBusyTimes(
				token,
				result.data
			);

			if (data.status === "invalid_token") {
				return reply
					.status(404)
					.send({
						message: INVALID_LINK_MESSAGE
					});
			}

			if (data.status === "no_open_week") {
				return reply
					.status(409)
					.send({
						message:
							"Hiện chưa có tuần nào mở nhận lịch bận."
					});
			}

			if (data.status === "deadline_passed") {
				return reply
					.status(409)
					.send({
						message:
							"Đã quá hạn chót báo lịch bận."
					});
			}

			if (data.status === "invalid_input") {
				return reply
					.status(400)
					.send({
						message:
							"Ngày bận phải nằm trong tuần đang mở."
					});
			}

			return reply.send({
				status: "ok"
			});
		}
	);
}
