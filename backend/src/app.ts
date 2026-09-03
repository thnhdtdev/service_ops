import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import {authRoutes} from "./modules/auth/auth.routes.js";
import {servicesRoutes} from "./modules/services/services.routes.js";
import { customersRoutes } from "./modules/customers/customers.route.js";
import { ordersRoutes } from "./modules/orders/orders.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
  origin: env.FRONTEND_URL,
  methods: ["GET", "HEAD", "POST", "PATCH", "OPTIONS"],
});

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "service-ops-api",
    };
  });

  app.register(authRoutes, { prefix: "/api" });
  app.register(servicesRoutes,{prefix:"/api/services"})
  app.register(customersRoutes,{prefix:"/api/customers"})
  app.register(dashboardRoutes, {prefix: "/api/dashboard" });
  app.register(ordersRoutes, {prefix: "/api/orders",});
  return app;
}
