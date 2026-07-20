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
	payment_status: AttentionOrder["paymentStatus"];
	total_amount: number;
	due_at: string | null;
	order_items: RawOrderItem[];
};

function formatQuantity(value: number) {
	return Number.isInteger(value) ? String(value) : String(value);
}

function getVietnamTodayRange() {
	const now = new Date();

	const vietnamDate = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(now);

	const start = new Date(`${vietnamDate}T00:00:00+07:00`);
	const end = new Date(start);

	end.setDate(end.getDate() + 1);

	return {
		start: start.toISOString(),
		end: end.toISOString()
	};
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
	const { start, end } = getVietnamTodayRange();

	const { data, error } = await supabase
		.from("orders")
		.select(
			`
    id,
    order_code,
    customer_name,
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
		.gte("created_at", start)
		.lt("created_at", end)
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
		paymentStatus: order.payment_status,
		totalAmount: Number(order.total_amount),
		dueAt: order.due_at
	}));
}
