import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { customerLookupSchema, getCustomersQuerySchema } from "./customers.schema.js";
import { findCustomerByPhone, getCustomers } from "./customers.service.js";

export async function customersRoutes(app: FastifyInstance) {
  app.get(
    "/lookup",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const result = customerLookupSchema.safeParse(
        request.query,
      );

      if (!result.success) {
        return reply.status(400).send({
          message: "Invalid query",
          errors: result.error.flatten(),
        });
      }

      const customer = await findCustomerByPhone(
        request.accessToken,
        result.data.phone,
      );

      return reply.status(200).send({
        customer,
      });
    },
  );

  app.get(
    "/",
    {
      preHandler: requireAuth,
    },
    async(request, reply) => {
      const result = getCustomersQuerySchema.safeParse(request.query);

      if(!result.success) {
        return reply.status(400).send({
          message: "Invalid query parameters",
          error: result.error.flatten()
        })
    }
    const data = await getCustomers(
      request.accessToken,
      result.data
    )
    return reply.send(data)
  }
  )
}