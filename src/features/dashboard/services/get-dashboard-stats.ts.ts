import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/features/dashboard/types";

function getVietnamTodayRange() {
  const now = new Date();

  const vietnamDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const start = new Date(`${vietnamDate}T00:00:00+07:00`);
  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { start, end } = getVietnamTodayRange();

  const [
    ordersTodayResult,
    processingOrdersResult,
    completedOrdersResult,
    unpaidOrdersResult,
    todayPaymentsResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start)
      .lt("created_at", end),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing"),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "unpaid"),

    supabase
      .from("payments")
      .select("amount")
      .gte("paid_at", start)
      .lt("paid_at", end),
  ]);

  if (ordersTodayResult.error) {
    throw new Error("Không thể tải tổng đơn hôm nay.");
  }

  if (processingOrdersResult.error) {
    throw new Error("Không thể tải đơn đang xử lý.");
  }

  if (completedOrdersResult.error) {
    throw new Error("Không thể tải đơn đã xong.");
  }

  if (unpaidOrdersResult.error) {
    throw new Error("Không thể tải đơn chưa thanh toán.");
  }

  if (todayPaymentsResult.error) {
    throw new Error("Không thể tải doanh thu hôm nay.");
  }

  const todayRevenue = (todayPaymentsResult.data ?? []).reduce(
    (total, payment) => {
      return total + Number(payment.amount);
    },
    0
  );

  return {
    ordersToday: ordersTodayResult.count ?? 0,
    processingOrders: processingOrdersResult.count ?? 0,
    completedOrders: completedOrdersResult.count ?? 0,
    unpaidOrders: unpaidOrdersResult.count ?? 0,
    todayRevenue,
  };
}