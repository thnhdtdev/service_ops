import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";

import { createOrderSchema } from "./orders.schema.js";
import { createOrder } from "./orders.service.js";

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
        request.user.id,
        result.data,
      );

      return reply
        .status(201)
        .send(data);
    },
  );
}