import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import {authRoutes} from "./modules/auth/auth.routes.js";
import {servicesRoutes} from "./modules/services/services.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: env.FRONTEND_URL,
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "service-ops-api",
    };
  });

  app.register(authRoutes, { prefix: "/api" });
  app.register(servicesRoutes,{prefix:"/api/services"})
  return app;
}
