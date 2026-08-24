import assert from "node:assert/strict";
import { test } from "node:test";

import { buildApp } from "./app.js";

test("GET /health returns the API status", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    status: "ok",
    service: "service-ops-api",
  });
});
