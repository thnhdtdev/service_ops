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
import { pushSubscriptionSchema } from "./modules/notifications/notifications.schema.js";
import { buildPaymentNotification } from "./modules/notifications/notifications.utils.js";
import { toStaffDashboardStats } from "./modules/dashboard/dashboard.utils.js";
import { getOrdersQuerySchema } from "./modules/orders/orders.schema.js";
import { customerSuggestQuerySchema } from "./modules/customers/customers.schema.js";
import { splitCustomerSearch } from "./modules/customers/customers.utils.js";

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

test("notification routes require login", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const requests = [
    { method: "GET", url: "/api/notifications/public-key" },
    { method: "POST", url: "/api/notifications/subscriptions" },
    { method: "DELETE", url: "/api/notifications/subscriptions" },
    { method: "POST", url: "/api/notifications/test" },
  ] as const;

  for (const request of requests) {
    const response = await app.inject(request);
    assert.equal(response.statusCode, 401, `${request.method} ${request.url}`);
  }
});

test("push subscriptions need an https endpoint and both keys", () => {
  const subscription = {
    endpoint: "https://web.push.apple.com/QGuQyavXutnMH",
    keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA", auth: "tBHItJI5svbpez7KI4CCXg" },
  };

  assert.equal(pushSubscriptionSchema.safeParse(subscription).success, true);
  assert.equal(pushSubscriptionSchema.safeParse({ ...subscription, endpoint: "http://push.example.com/1" }).success, false);
  assert.equal(pushSubscriptionSchema.safeParse({ ...subscription, keys: { p256dh: "abc" } }).success, false);
});

test("payment notification shows amount, method, order and opens the order", () => {
  const payload = buildPaymentNotification({
    orderId: "5f0c7a52-0000-4000-8000-000000000001",
    orderCode: "SB-031126-004",
    customerName: "Nguyễn Văn A",
    amount: 200000,
    method: "bank_transfer",
    paymentKey: "p1",
  });

  // Intl puts a non-breaking space before ₫.
  assert.equal(payload.title, "Đã nhận 200.000\u00a0₫");
  assert.equal(payload.body, "Chuyển khoản · SB-031126-004 · Nguyễn Văn A");
  assert.equal(payload.url, "/orders/5f0c7a52-0000-4000-8000-000000000001");
  assert.equal(payload.tag, "payment-p1");
});

test("dashboard stats for staff contain order counts only, no money", () => {
  const adminStats = {
    ordersToday: 12,
    unpaidOrders: 3,
    ordersWithPaymentToday: 9,
    todayRevenue: 2450000,
    todayOrderValue: 3100000,
  };

  assert.deepEqual(toStaffDashboardStats(adminStats), { ordersToday: 12, unpaidOrders: 3 });
});

test("dashboard routes require login", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  for (const url of ["/api/dashboard/stats", "/api/dashboard/revenue-chart", "/api/dashboard/service-mix"]) {
    const response = await app.inject({ method: "GET", url });
    assert.equal(response.statusCode, 401, url);
  }
});

test("order search accepts codes, phones and Vietnamese names, rejects filter syntax", () => {
  for (const search of ["SB-031126-004", "0901 234 567", "Nguyễn Văn A"]) {
    assert.equal(getOrdersQuerySchema.safeParse({ search }).success, true, search);
  }

  // , . ( ) would change the meaning of the PostgREST or() filter.
  for (const search of ["a,status.eq.paid", "x)", "50%"]) {
    assert.equal(getOrdersQuerySchema.safeParse({ search }).success, false, search);
  }
});

test("customer search splits the name from the phone digits", () => {
  assert.deepEqual(splitCustomerSearch("yen 202"), { name: "yen", digits: "202" });
  assert.deepEqual(splitCustomerSearch("0901 234 202"), { name: null, digits: "0901234202" });
  assert.deepEqual(splitCustomerSearch("  Yến   Nhi "), { name: "Yến Nhi", digits: null });
  assert.deepEqual(splitCustomerSearch("84901234202"), { name: null, digits: "0901234202" });
});

test("customer suggest query needs 2+ characters and no LIKE wildcards", () => {
  assert.equal(customerSuggestQuerySchema.safeParse({ q: "yến 202" }).success, true);
  assert.equal(customerSuggestQuerySchema.safeParse({ q: "y" }).success, false);
  assert.equal(customerSuggestQuerySchema.safeParse({ q: "%" + "a" }).success, false);
  assert.equal(customerSuggestQuerySchema.safeParse({ q: "a_b" }).success, false);
});

test("customer suggest requires login", async (context) => {
  const app = buildApp();

  context.after(async () => {
    await app.close();
  });

  const response = await app.inject({ method: "GET", url: "/api/customers/suggest?q=yen" });

  assert.equal(response.statusCode, 401);
});
