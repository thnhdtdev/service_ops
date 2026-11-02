import assert from "node:assert/strict";
import { test } from "node:test";

import { buildApp } from "./app.js";
import {
  STAFF_LINK_TOKEN_PATTERN,
  generateStaffLinkToken,
  hashStaffLinkToken,
} from "./modules/staff-members/staff-members.utils.js";
import {
  type BusyTime,
  addDaysToDate,
  buildShiftAvailability,
  findOverlappingBusyTimes,
  getIsoWeekday,
} from "./modules/schedules/schedules.utils.js";
import { createScheduleWeekSchema } from "./modules/schedules/schedules.schema.js";
import { updateShiftTemplateSchema } from "./modules/shift-templates/shift-templates.schema.js";
import { saveBusyTimesSchema } from "./modules/staff-portal/staff-portal.schema.js";

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

test("schedule date helpers use Monday = 1 and cross month/year", () => {
  assert.equal(getIsoWeekday("2026-11-09"), 1);
  assert.equal(getIsoWeekday("2026-11-15"), 7);
  assert.equal(addDaysToDate("2026-12-28", 6), "2027-01-03");
});

function busyTime(overrides: Partial<BusyTime>): BusyTime {
  return {
    staff_member_id: "lan",
    repeat_weekly: false,
    busy_date: null,
    weekday: null,
    start_time: "00:00:00",
    end_time: "24:00:00",
    note: null,
    ...overrides,
  };
}

test("busy times overlap a shift only on the same day and time", () => {
  // Monday 2026-11-09, 07:00-12:00
  const shift = {
    shift_date: "2026-11-09",
    start_time: "07:00:00",
    end_time: "12:00:00",
  };

  const weeklyMonday = busyTime({ repeat_weekly: true, weekday: 1, start_time: "11:00:00", end_time: "13:00:00" });
  const weeklyTuesday = busyTime({ repeat_weekly: true, weekday: 2 });
  const touchingOnly = busyTime({ busy_date: "2026-11-09", start_time: "12:00:00", end_time: "17:00:00" });
  const wholeDay = busyTime({ busy_date: "2026-11-09" });
  const otherDate = busyTime({ busy_date: "2026-11-10" });

  assert.deepEqual(
    findOverlappingBusyTimes(shift, [weeklyMonday, weeklyTuesday, touchingOnly, wholeDay, otherDate]),
    [weeklyMonday, wholeDay],
  );
});

test("shift availability splits staff into assigned, available and busy", () => {
  const [result] = buildShiftAvailability(
    [
      {
        id: "shift-1",
        name: "Sáng",
        shift_date: "2026-11-09",
        start_time: "07:00:00",
        end_time: "12:00:00",
        shift_assignments: [{ staff_member_id: "lan" }],
      },
    ],
    [
      { id: "lan", full_name: "Lan", is_active: true },
      { id: "minh", full_name: "Minh", is_active: true },
      { id: "hoa", full_name: "Hoa", is_active: true },
      { id: "nghi", full_name: "Nghỉ việc", is_active: false },
    ],
    [
      busyTime({ staff_member_id: "lan", busy_date: "2026-11-09", note: "Đi học" }),
      busyTime({ staff_member_id: "hoa", repeat_weekly: true, weekday: 1 }),
    ],
  );

  assert.deepEqual(result.assigned.map((m) => [m.full_name, m.busy_times.length]), [["Lan", 1]]);
  assert.deepEqual(result.available.map((m) => m.full_name), ["Minh"]);
  assert.deepEqual(result.busy.map((m) => m.full_name), ["Hoa"]);
});

test("schedule week must start on a Monday", () => {
  const deadline = "2026-11-08T17:00:00+07:00";

  assert.equal(createScheduleWeekSchema.safeParse({ week_start: "2026-11-09", availability_deadline: deadline }).success, true);
  assert.equal(createScheduleWeekSchema.safeParse({ week_start: "2026-11-10", availability_deadline: deadline }).success, false);
});

test("shift template times must be updated together", () => {
  assert.equal(updateShiftTemplateSchema.safeParse({ start_time: "08:00" }).success, false);
  assert.equal(updateShiftTemplateSchema.safeParse({ start_time: "13:00", end_time: "12:00" }).success, false);
  assert.equal(updateShiftTemplateSchema.safeParse({ start_time: "08:00", end_time: "24:00" }).success, true);
});

test("schedule routes require a login", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const responses = await Promise.all([
    app.inject({ method: "GET", url: "/api/shift-templates" }),
    app.inject({ method: "GET", url: "/api/schedule-weeks" }),
    app.inject({ method: "DELETE", url: "/api/shifts/00000000-0000-0000-0000-000000000000" }),
  ]);

  assert.deepEqual(responses.map((response) => response.statusCode), [401, 401, 401]);
});

test("staff portal rejects a missing or malformed token without caching", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const missing = await app.inject({ method: "GET", url: "/api/staff-portal" });
  const malformed = await app.inject({
    method: "PUT",
    url: "/api/staff-portal/busy-times",
    headers: { "x-staff-token": "not-a-real-token" },
    payload: { busy_times: [] },
  });

  for (const response of [missing, malformed]) {
    assert.equal(response.statusCode, 404);
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal(response.headers["referrer-policy"], "no-referrer");
  }
});

test("staff portal GET is limited to 30 requests per minute per IP", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const statusCodes: number[] = [];

  for (let i = 0; i < 31; i++) {
    const response = await app.inject({ method: "GET", url: "/api/staff-portal" });
    statusCodes.push(response.statusCode);
  }

  assert.equal(statusCodes[29], 404);
  assert.equal(statusCodes[30], 429);
});

test("busy times accept weekly and one-day items only when valid", () => {
  const weekly = { repeat_weekly: true, weekday: 2, start_time: "07:00", end_time: "12:00", note: "Đi học" };
  const oneDay = { repeat_weekly: false, busy_date: "2026-11-12", start_time: "00:00", end_time: "24:00" };

  assert.equal(saveBusyTimesSchema.safeParse({ busy_times: [weekly, oneDay] }).success, true);
  assert.equal(saveBusyTimesSchema.safeParse({ busy_times: [{ ...weekly, end_time: "06:00" }] }).success, false);
  // A weekly item needs a weekday, a one-day item needs a date.
  assert.equal(saveBusyTimesSchema.safeParse({ busy_times: [{ ...oneDay, repeat_weekly: true }] }).success, false);
  assert.equal(saveBusyTimesSchema.safeParse({ busy_times: Array(51).fill(oneDay) }).success, false);
});
