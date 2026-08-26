import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth/auth.middleware.js';
import { getServices } from "./services.service.js";

export async function servicesRoutes(app: FastifyInstance) {
    app.get(
        '/',
        {
            preHandler: requireAuth,
        },
        async (request) => {
            const services = await getServices(request.accessToken)
            return{
                services,
            }
        }
    )
}