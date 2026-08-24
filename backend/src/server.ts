import { buildApp } from "./app.js";

const app = buildApp();

async function start() {
  try {
    const port = Number(process.env.PORT ?? "3001");

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error("PORT must be an integer between 1 and 65535.");
    }

    await app.listen({
      port,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
