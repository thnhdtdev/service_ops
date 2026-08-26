import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth/auth.middleware.js';
import { getServices } from "./services.service.js";

export async function servicesRoutes(app: FastifyInstance) {
    app.get<{
    Querystring: {
        active?: string;
    };
    }>(
    "/",
    {
        preHandler: requireAuth,
    },
    async (request) => {
        const activeOnly = request.query.active === "true";

        const services = await getServices(
        request.accessToken,
        activeOnly,
        );

        return {
        services,
        };
    },
    );
}