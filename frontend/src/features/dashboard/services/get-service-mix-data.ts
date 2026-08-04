import { createClient } from "@/lib/supabase/server";
import type {
	RevenueChartPeriod,
	ServiceMixData,
	ServiceMixDataPoint
} from "@/features/dashboard/types";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const QUERY_PAGE_SIZE = 1000;
const ORDER_ID_CHUNK_SIZE = 100;

const vietnamDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: VIETNAM_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
});

type RawPayment = {
	order_id: string;
	amount: number | string;
	paid_at: string;
};

type RawOrder = {
	id: string;
	created_at: string;
};

type RawOrderItem = {
	order_id: string;
	service_id: string;
	service_name: string;
	line_total: number | string;
};

type ServiceValue = {
	serviceId: string;
	serviceName: string;
	value: number;
};

type ServiceValueMaps = Record<RevenueChartPeriod, Map<string, ServiceValue>>;

export type ServiceMixResult = {
	data: ServiceMixData;
	error: string | null;
};

function addDays(dateKey: string, numberOfDays: number) {
	const [year, month, day] = dateKey.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day + numberOfDays));

	return date.toISOString().slice(0, 10);
}

function getVietnamDateKey(value: string | Date) {
	return vietnamDateFormatter.format(new Date(value));
}

function toVietnamDayBoundary(dateKey: string) {
	return new Date(`${dateKey}T00:00:00+07:00`).toISOString();
}

function createEmptyData(): ServiceMixData {
	return {
		week: {
			revenue: [],
			selections: []
		},
		month: {
			revenue: [],
			selections: []
		}
	};
}

function createValueMaps(): ServiceValueMaps {
	return {
		week: new Map(),
		month: new Map()
	};
}

function getPeriodsForDate(
	dateKey: string,
	weekStart: string,
	monthStart: string,
	today: string
): RevenueChartPeriod[] {
	const periods: RevenueChartPeriod[] = [];

	if (dateKey >= weekStart && dateKey <= today) {
		periods.push("week");
	}

	if (dateKey >= monthStart && dateKey <= today) {
		periods.push("month");
	}

	return periods;
}

function addServiceValue(map: Map<string, ServiceValue>, item: RawOrderItem, value: number) {
	if (!Number.isFinite(value) || value <= 0) {
		return;
	}

	const serviceId = item.service_id || item.service_name;
	const current = map.get(serviceId);

	map.set(serviceId, {
		serviceId,
		serviceName: item.service_name,
		value: (current?.value ?? 0) + value
	});
}

function toDataPoints(map: Map<string, ServiceValue>): ServiceMixDataPoint[] {
	return Array.from(map.values())
		.sort((first, second) => second.value - first.value)
		.map((item) => ({
			serviceId: item.serviceId,
			serviceName: item.serviceName,
			value: item.value
		}));
}

export async function getServiceMixData(): Promise<ServiceMixResult> {
	const emptyData = createEmptyData();
	const today = getVietnamDateKey(new Date());
	const weekStart = addDays(today, -6);
	const monthStart = `${today.slice(0, 7)}-01`;
	const queryStart = weekStart < monthStart ? weekStart : monthStart;
	const queryEnd = addDays(today, 1);
	const supabase = await createClient();
	const payments: RawPayment[] = [];
	const orders: RawOrder[] = [];

	for (let from = 0; ; from += QUERY_PAGE_SIZE) {
		const { data, error } = await supabase
			.from("payments")
			.select("order_id, amount, paid_at")
			.gte("paid_at", toVietnamDayBoundary(queryStart))
			.lt("paid_at", toVietnamDayBoundary(queryEnd))
			.order("paid_at", { ascending: true })
			.range(from, from + QUERY_PAGE_SIZE - 1);

		if (error) {
			console.error("Supabase service mix payments error:", error);

			return {
				data: emptyData,
				error: "Không thể tải dữ liệu cơ cấu dịch vụ. Vui lòng thử lại."
			};
		}

		const page = (data ?? []) as RawPayment[];
		payments.push(...page);

		if (page.length < QUERY_PAGE_SIZE) {
			break;
		}
	}

	for (let from = 0; ; from += QUERY_PAGE_SIZE) {
		const { data, error } = await supabase
			.from("orders")
			.select("id, created_at")
			.gte("created_at", toVietnamDayBoundary(queryStart))
			.lt("created_at", toVietnamDayBoundary(queryEnd))
			.neq("status", "cancelled")
			.order("created_at", { ascending: true })
			.range(from, from + QUERY_PAGE_SIZE - 1);

		if (error) {
			console.error("Supabase service mix orders error:", error);

			return {
				data: emptyData,
				error: "Không thể tải dữ liệu cơ cấu dịch vụ. Vui lòng thử lại."
			};
		}

		const page = (data ?? []) as RawOrder[];
		orders.push(...page);

		if (page.length < QUERY_PAGE_SIZE) {
			break;
		}
	}

	const orderIds = Array.from(
		new Set([
			...payments.map((payment) => payment.order_id),
			...orders.map((order) => order.id)
		])
	);
	const orderItems: RawOrderItem[] = [];

	for (let start = 0; start < orderIds.length; start += ORDER_ID_CHUNK_SIZE) {
		const idChunk = orderIds.slice(start, start + ORDER_ID_CHUNK_SIZE);

		for (let from = 0; ; from += QUERY_PAGE_SIZE) {
			const { data, error } = await supabase
				.from("order_items")
				.select("order_id, service_id, service_name, line_total")
				.in("order_id", idChunk)
				.order("order_id", { ascending: true })
				.range(from, from + QUERY_PAGE_SIZE - 1);

			if (error) {
				console.error("Supabase service mix order items error:", error);

				return {
					data: emptyData,
					error: "Không thể tải dữ liệu cơ cấu dịch vụ. Vui lòng thử lại."
				};
			}

			const page = (data ?? []) as RawOrderItem[];
			orderItems.push(...page);

			if (page.length < QUERY_PAGE_SIZE) {
				break;
			}
		}
	}

	const itemsByOrder = new Map<string, RawOrderItem[]>();

	for (const item of orderItems) {
		const items = itemsByOrder.get(item.order_id) ?? [];
		items.push(item);
		itemsByOrder.set(item.order_id, items);
	}

	const revenueMaps = createValueMaps();
	const selectionMaps = createValueMaps();

	for (const payment of payments) {
		const paymentAmount = Number(payment.amount);
		const paidAt = new Date(payment.paid_at);
		const items = (itemsByOrder.get(payment.order_id) ?? []).filter(
			(item) => Number(item.line_total) > 0
		);
		const orderTotal = items.reduce((total, item) => total + Number(item.line_total), 0);

		if (
			!Number.isFinite(paymentAmount) ||
			paidAt.toString() === "Invalid Date" ||
			orderTotal <= 0
		) {
			continue;
		}

		const periods = getPeriodsForDate(getVietnamDateKey(paidAt), weekStart, monthStart, today);

		for (const item of items) {
			const allocatedRevenue = paymentAmount * (Number(item.line_total) / orderTotal);

			for (const period of periods) {
				addServiceValue(revenueMaps[period], item, allocatedRevenue);
			}
		}
	}

	for (const order of orders) {
		const createdAt = new Date(order.created_at);

		if (createdAt.toString() === "Invalid Date") {
			continue;
		}

		const periods = getPeriodsForDate(
			getVietnamDateKey(createdAt),
			weekStart,
			monthStart,
			today
		);
		const selectedServices = new Map<string, RawOrderItem>();

		for (const item of itemsByOrder.get(order.id) ?? []) {
			selectedServices.set(item.service_id || item.service_name, item);
		}

		for (const item of selectedServices.values()) {
			for (const period of periods) {
				addServiceValue(selectionMaps[period], item, 1);
			}
		}
	}

	return {
		data: {
			week: {
				revenue: toDataPoints(revenueMaps.week),
				selections: toDataPoints(selectionMaps.week)
			},
			month: {
				revenue: toDataPoints(revenueMaps.month),
				selections: toDataPoints(selectionMaps.month)
			}
		},
		error: null
	};
}
