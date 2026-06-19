import { SERVICE_UNIT_LABEL, type ServiceUnit } from "@/constants/service-unit";
import { createClient } from "@/lib/supabase/server";
import type { AttentionOrder } from "@/features/dashboard/types";

type RawOrderItem = {
  service_name: string;
  quantity: number;
  unit: ServiceUnit;
};

type RawAttentionOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  status: AttentionOrder["status"];
  payment_status: AttentionOrder["paymentStatus"];
  total_amount: number;
  due_at: string | null;
  order_items: RawOrderItem[];
};

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function getServiceSummary(items: RawOrderItem[]) {
  if (!items.length) {
    return "Chưa có dịch vụ";
  }

  return items
    .map((item) => {
      const unitLabel = SERVICE_UNIT_LABEL[item.unit];

      return `${item.service_name} ${formatQuantity(item.quantity)} ${unitLabel}`;
    })
    .join(", ");
}

export async function getAttentionOrders(): Promise<AttentionOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_code,
      customer_name,
      status,
      payment_status,
      total_amount,
      due_at,
      order_items (
        service_name,
        quantity,
        unit
      )
    `
    )
    .or("payment_status.eq.unpaid,status.in.(received,processing,completed)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error("Không thể tải danh sách đơn cần chú ý.");
  }

  return ((data ?? []) as RawAttentionOrder[]).map((order) => ({
    id: order.id,
    orderCode: order.order_code,
    customerName: order.customer_name,
    serviceSummary: getServiceSummary(order.order_items ?? []),
    status: order.status,
    paymentStatus: order.payment_status,
    totalAmount: Number(order.total_amount),
    dueAt: order.due_at,
  }));
}