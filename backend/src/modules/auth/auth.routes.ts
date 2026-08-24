import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/auth/auth.middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      return {
        user: {
          id: request.user.id,
          email: request.user.email,
        },
      };
    },
  );
}