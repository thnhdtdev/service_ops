import Fastify from "fastify";
import {authRoutes} from "./modules/auth/auth.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "service-ops-api",
    };
  });

  app.register(authRoutes, { prefix: "/api" });

  return app;
}
