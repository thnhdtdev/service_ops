import type { FastifyInstance } from 'fastify';

import { getServices, createService, updateService } from "./services.service.js";
import { requireAuth } from '../../middleware/auth/auth.middleware.js';
import { requireRole } from "../../middleware/auth/require-role.middleware.js";
import {createSchemaService, updateServiceSchema} from "../services/services.schema.js"
import { request } from 'node:http';
import { log } from 'node:console';
import id from 'zod/v4/locales/id.js';
export async function servicesRoutes(app: FastifyInstance) {

    //GET /api/services
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

    //POST /api/service
    app.post(
        "/",
        {
            preHandler:[
                requireAuth,
                requireRole("admin"),
            ]
        },
        async (request, reply) =>{
            const result = createSchemaService.safeParse(
                request.body,
            )
            if (!result.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: result.error.flatten(),
        });
      }

      const service = await createService(
        request.accessToken,
        result.data,
      );

      return reply.status(201).send({
        service,
      });
        }
    )

    //PATCH /api/:id
    app.patch<{
        Params:{
            id: string
        };
    }>(
        "/:id",
        {
            preHandler:[
                requireAuth,
                requireRole("admin"),
            ]
        },
        async (request, reply)=>{
            const result = updateServiceSchema.safeParse(
                request.body,        
            )         

            if(!result.success){
                return reply.status(400).send({
                    message: "Invalid request body",
                    errors: result.error.flatten(),
                })
            }

            const service = await updateService(
                request.accessToken,
                request.params.id,
                result.data
            )

            return reply.status(200).send(service)

        }
    )
}