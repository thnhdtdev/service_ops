import { createClient } from "@/lib/supabase/server";
import type {
	CustomerDetail,
	CustomerOrderHistoryItem,
	CustomerOrderItem,
	CustomerOrderPayment
} from "@/features/customers/types";

const ORDERS_PER_PAGE = 12;

type RawCustomer = {
	id: string;
	name: string;
	phone: string | null;
	created_at: string;
};

type RawOrderItem = {
	service_name: string;
	unit: string;
	quantity: number | string;
	unit_price: number | string;
	line_total: number | string;
};

type RawPayment = {
	amount: number | string;
	method: string;
	paid_at: string;
};

type RawOrder = {
	id: string;
	order_code: string;
	customer_name: string;
	customer_phone: string | null;
	status: string;
	payment_status: string;
	total_amount: number | string;
	due_at: string | null;
	note: string | null;
	created_at: string;
	order_items: RawOrderItem | RawOrderItem[] | null;
	payments: RawPayment | RawPayment[] | null;
};

function relationToArray<T>(value: T | T[] | null) {
	if (!value) return [];

	return Array.isArray(value) ? value : [value];
}

function toNumber(value: number | string) {
	const number = Number(value);

	return Number.isFinite(number) ? number : 0;
}

function toOrderItem(item: RawOrderItem): CustomerOrderItem {
	return {
		serviceName: item.service_name,
		unit: item.unit,
		quantity: toNumber(item.quantity),
		unitPrice: toNumber(item.unit_price),
		lineTotal: toNumber(item.line_total)
	};
}

function toPayment(payment: RawPayment): CustomerOrderPayment {
	return {
		amount: toNumber(payment.amount),
		method: payment.method,
		paidAt: payment.paid_at
	};
}

function toOrderHistoryItem(order: RawOrder): CustomerOrderHistoryItem {
	return {
		id: order.id,
		orderCode: order.order_code,
		customerName: order.customer_name,
		customerPhone: order.customer_phone,
		status: order.status,
		paymentStatus: order.payment_status,
		totalAmount: toNumber(order.total_amount),
		dueAt: order.due_at,
		note: order.note,
		createdAt: order.created_at,
		items: relationToArray(order.order_items).map(toOrderItem),
		payments: relationToArray(order.payments)
			.map(toPayment)
			.sort((first, second) => second.paidAt.localeCompare(first.paidAt))
	};
}

function normalizePage(value: number) {
	if (!Number.isFinite(value)) return 1;

	return Math.max(1, Math.floor(value));
}

export async function getCustomerDetail(
	customerId: string,
	requestedPage = 1
): Promise<CustomerDetail | null> {
	const supabase = await createClient();

	const [customerResult, totalOrdersResult] = await Promise.all([
		supabase
			.from("customers")
			.select("id, name, phone, created_at")
			.eq("id", customerId)
			.maybeSingle(),
		supabase
			.from("orders")
			.select("id", { count: "exact", head: true })
			.eq("customer_id", customerId)
	]);

	if (customerResult.error) {
		console.error("Supabase customer detail error:", customerResult.error);
		throw new Error("Không thể tải hồ sơ khách hàng.");
	}

	if (totalOrdersResult.error) {
		console.error("Supabase customer order count error:", totalOrdersResult.error);
		throw new Error("Không thể tải tổng số đơn của khách hàng.");
	}

	if (!customerResult.data) {
		return null;
	}

	const totalOrderCount = totalOrdersResult.count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalOrderCount / ORDERS_PER_PAGE));
	const page = Math.min(normalizePage(requestedPage), totalPages);
	const rangeStart = (page - 1) * ORDERS_PER_PAGE;
	const rangeEnd = rangeStart + ORDERS_PER_PAGE - 1;

	const [ordersResult, unpaidOrdersResult, lastOrderResult] = await Promise.all([
		supabase
			.from("orders")
			.select(
				`
					id,
					order_code,
					customer_name,
					customer_phone,
					status,
					payment_status,
					total_amount,
					due_at,
					note,
					created_at,
					order_items (
						service_name,
						unit,
						quantity,
						unit_price,
						line_total
					),
					payments (
						amount,
						method,
						paid_at
					)
				`
			)
			.eq("customer_id", customerId)
			.order("created_at", { ascending: false })
			.range(rangeStart, rangeEnd),
		supabase
			.from("orders")
			.select("id", { count: "exact", head: true })
			.eq("customer_id", customerId)
			.eq("payment_status", "unpaid")
			.neq("status", "cancelled"),
		supabase
			.from("orders")
			.select("created_at")
			.eq("customer_id", customerId)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle()
	]);

	if (ordersResult.error) {
		console.error("Supabase customer order history error:", ordersResult.error);
		throw new Error("Không thể tải lịch sử đơn hàng.");
	}

	if (unpaidOrdersResult.error) {
		console.error("Supabase customer unpaid order count error:", unpaidOrdersResult.error);
		throw new Error("Không thể tải số đơn chưa thanh toán.");
	}

	if (lastOrderResult.error) {
		console.error("Supabase customer last order error:", lastOrderResult.error);
		throw new Error("Không thể tải đơn gần nhất.");
	}

	const customer = customerResult.data as RawCustomer;

	return {
		customer: {
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			createdAt: customer.created_at
		},
		orders: ((ordersResult.data ?? []) as RawOrder[]).map(toOrderHistoryItem),
		totalOrderCount,
		unpaidOrderCount: unpaidOrdersResult.count ?? 0,
		lastOrderAt: lastOrderResult.data?.created_at ?? null,
		page,
		totalPages
	};
}
