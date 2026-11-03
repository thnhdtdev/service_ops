import type { FastifyInstance, FastifyRequest } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import {
	sendPaymentNotification,
	type PaymentNotificationTarget
} from "../notifications/notifications.service.js";

import {
	createOrderSchema,
	getOrderParamsSchema,
	getOrdersQuerySchema,
	addOrderPaymentSchema
} from "./orders.schema.js";

import {
	createOrder,
	getOrderDetail,
	getOrders,
	addOrderPayment
} from "./orders.service.js";

// Sends the push without waiting for it, so the response is not delayed.
// The payment is already saved: a failed notification is only logged.
function sendPaymentNotificationInBackground(
	request: FastifyRequest,
	payment: PaymentNotificationTarget
) {
	sendPaymentNotification(
		request.accessToken,
		payment,
		request.log
	)
		.then((result) => {
			request.log.info(
				result,
				"Payment notification sent"
			);
		})
		.catch((error: unknown) => {
			request.log.error(
				{ err: error },
				"Failed to send payment notification"
			);
		});
}

export async function ordersRoutes(
	app: FastifyInstance
) {
	app.post(
		"/",
		{
			preHandler: requireAuth
		},
		async (request, reply) => {
			const result =
				createOrderSchema.safeParse(
					request.body
				);

			if (!result.success) {
				return reply.status(400).send({
					message:
						"Invalid request body",
					errors:
						result.error.flatten()
				});
			}

			const data = await createOrder(
				request.accessToken,
				result.data
			);

			// The order was paid (fully or partly) when it was created.
			if (result.data.paid_amount && result.data.paid_amount > 0) {
				sendPaymentNotificationInBackground(request, {
					orderId: data.order.id,
					amount: result.data.paid_amount,
					method: result.data.payment_method ?? "other",
					paymentKey: `order-${data.order.id}`
				});
			}

			return reply
				.status(201)
				.send(data);
		}
	);

	app.get(
		"/",
		{
			preHandler: requireAuth
		},
		async (request, reply) => {
			const result =
				getOrdersQuerySchema.safeParse(
					request.query
				);

			if (!result.success) {
				return reply
					.status(400)
					.send({
						message:
							"Invalid query parameters",
						errors:
							result.error.flatten()
					});
			}

			const data = await getOrders(
				request.accessToken,
				result.data
			);

			return reply.send(data);
		}
	);

	app.get(
		"/:id",
		{
			preHandler: requireAuth
		},
		async (request, reply) => {
			const result =
				getOrderParamsSchema.safeParse(
					request.params
				);

			if (!result.success) {
				return reply.status(400).send({
					message:
						"Invalid order ID",
					errors:
						result.error.flatten()
				});
			}

			const data =
				await getOrderDetail(
					request.accessToken,
					result.data.id
				);

			if (!data) {
				return reply.status(404).send({
					message:
						"Order not found"
				});
			}

			return reply.send(data);
		}
	);

	app.post(
		"/:id/payments",
		{
			preHandler: requireAuth
		},
		async (request, reply) => {
			const paramsResult =
				getOrderParamsSchema.safeParse(
					request.params
				);

			if (!paramsResult.success) {
				return reply.status(400).send({
					message:
						"Invalid order ID",
					errors:
						paramsResult.error.flatten()
				});
			}

			const bodyResult =
				addOrderPaymentSchema.safeParse(
					request.body
				);

			if (!bodyResult.success) {
				return reply.status(400).send({
					message:
						"Invalid payment data",
					errors:
						bodyResult.error.flatten()
				});
			}

			const data =
				await addOrderPayment(
					request.accessToken,
					paramsResult.data.id,
					bodyResult.data
				);

			if (
				data.status === "not_found"
			) {
				return reply.status(404).send({
					message:
						"Order not found"
				});
			}

			if (data.status === "success") {
				sendPaymentNotificationInBackground(request, {
					orderId: paramsResult.data.id,
					amount: Number(data.payment.amount),
					method: data.payment.method,
					paymentKey: data.payment.id
				});
			}

			return reply.send(data);
		}
	);
}