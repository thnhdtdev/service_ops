import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { requireRole } from "../../middleware/auth/require-role.middleware.js";

import {
	deletePushSubscriptionSchema,
	pushSubscriptionSchema
} from "./notifications.schema.js";

import {
	deletePushSubscription,
	getVapidPublicKey,
	savePushSubscription,
	sendTestPush
} from "./notifications.service.js";

// Only admins receive payment notifications, so every route is admin-only.
export async function notificationsRoutes(
	app: FastifyInstance
) {
	// GET /api/notifications/public-key
	// The browser needs the VAPID public key to subscribe.
	app.get(
		"/public-key",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async () => {
			return {
				public_key: getVapidPublicKey()
			};
		}
	);

	// POST /api/notifications/subscriptions
	app.post(
		"/subscriptions",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				pushSubscriptionSchema.safeParse(
					request.body
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid push subscription",
						errors:
							result.error.flatten()
					});
			}

			await savePushSubscription(
				request.accessToken,
				request.user.id,
				result.data,
				request.headers["user-agent"]
			);

			return reply
				.status(201)
				.send({
					subscribed: true
				});
		}
	);

	// DELETE /api/notifications/subscriptions
	app.delete(
		"/subscriptions",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				deletePushSubscriptionSchema.safeParse(
					request.body
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid push subscription",
						errors:
							result.error.flatten()
					});
			}

			await deletePushSubscription(
				request.accessToken,
				result.data.endpoint
			);

			return {
				unsubscribed: true
			};
		}
	);

	// POST /api/notifications/test
	app.post(
		"/test",
		{
			preHandler: [
				requireAuth,
				requireRole("admin")
			]
		},
		async (request, reply) => {
			const result =
				await sendTestPush(
					request.accessToken,
					request.log
				);

			if (result.devices === 0) {
				return reply
					.status(404)
					.send({
						message:
							"Chưa có thiết bị nào bật thông báo."
					});
			}

			if (result.sent === 0) {
				return reply
					.status(502)
					.send({
						message:
							"Không gửi được thông báo thử. Hãy tắt rồi bật lại thông báo."
					});
			}

			return result;
		}
	);
}
