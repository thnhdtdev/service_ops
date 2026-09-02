import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";

import { createOrderSchema, getOrderParamsSchema, getOrdersQuerySchema } from "./orders.schema.js";
import { createOrder, getOrderDetail, getOrders } from "./orders.service.js";

export async function ordersRoutes(
  app: FastifyInstance,
) {
  app.post(
    "/",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const result =
          createOrderSchema.safeParse(
          request.body,
        );

      if (!result.success) {
        return reply.status(400).send({
          message:
            "Invalid request body",
          errors:
            result.error.flatten(),
        });
      }

      const data = await createOrder(
        request.accessToken,
        result.data
      );

      return reply
        .status(201)
        .send(data);
    },
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
		const result = getOrderParamsSchema.safeParse(
	request.params
);

          if (!result.success) {
        return reply.status(400).send({
          message: "Invalid order ID",
          errors: result.error.flatten()
        });
      }

      const data = await getOrderDetail(
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
}