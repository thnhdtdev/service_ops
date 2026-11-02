import assert from "node:assert/strict";
import { test } from "node:test";

import { buildApp } from "./app.js";
import {
  STAFF_LINK_TOKEN_PATTERN,
  generateStaffLinkToken,
  hashStaffLinkToken,
} from "./modules/staff-members/staff-members.utils.js";

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

test("staff link tokens are 43 base64url characters and unique", () => {
  const first = generateStaffLinkToken();
  const second = generateStaffLinkToken();

  assert.match(first, STAFF_LINK_TOKEN_PATTERN);
  assert.match(second, STAFF_LINK_TOKEN_PATTERN);
  assert.notEqual(first, second);
});

test("staff link token hash is hex SHA-256", () => {
  // Known SHA-256 of "abc", same as encode(digest('abc', 'sha256'), 'hex').
  assert.equal(
    hashStaffLinkToken("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("staff member routes require a login", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const listResponse = await app.inject({
    method: "GET",
    url: "/api/staff-members",
  });

  const linkResponse = await app.inject({
    method: "POST",
    url: "/api/staff-members/00000000-0000-0000-0000-000000000000/link",
  });

  assert.equal(listResponse.statusCode, 401);
  assert.equal(linkResponse.statusCode, 401);
});
