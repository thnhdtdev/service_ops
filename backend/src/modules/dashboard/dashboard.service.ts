import { createUserSupabase } from "../../lib/supabase.js";
import {
	addDays,
	getVietnamDateKey,
	getVietnamTodayRange,
	toVietnamDayBoundary
} from "./dashboard.utils.js";

export async function getDashboardStats(
	accessToken: string
) {
	const supabase =
		createUserSupabase(accessToken);

	const { start, end } =
		getVietnamTodayRange();

	const [
		ordersTodayResult,
		unpaidOrdersResult,
		paidOrdersTodayResult,
		todayPaymentsResult,
		todayOrdersValueResult
	] = await Promise.all([
		supabase
			.from("orders")
			.select("id", {
				count: "exact",
				head: true
			})
			.gte("created_at", start)
			.lt("created_at", end),

		supabase
			.from("orders")
			.select("id", {
				count: "exact",
				head: true
			})
			.eq(
				"payment_status",
				"unpaid"
			),

		supabase
			.from("payments")
			.select("id", {
				count: "exact",
				head: true
			})
			.gte("paid_at", start)
			.lt("paid_at", end),

		supabase
			.from("payments")
			.select("amount")
			.gte("paid_at", start)
			.lt("paid_at", end),

		supabase
			.from("orders")
			.select("total_amount")
			.gte("created_at", start)
			.lt("created_at", end)
	]);

	if (ordersTodayResult.error) {
		throw ordersTodayResult.error;
	}

	if (unpaidOrdersResult.error) {
		throw unpaidOrdersResult.error;
	}

	if (paidOrdersTodayResult.error) {
		throw paidOrdersTodayResult.error;
	}

	if (todayPaymentsResult.error) {
		throw todayPaymentsResult.error;
	}

	if (todayOrdersValueResult.error) {
		throw todayOrdersValueResult.error;
	}

	const todayRevenue =
		(todayPaymentsResult.data ?? []).reduce(
			(total, payment) =>
				total + Number(payment.amount),
			0
		);

	const todayOrderValue =
		(todayOrdersValueResult.data ?? []).reduce(
			(total, order) =>
				total +
				Number(order.total_amount),
			0
		);

	return {
		ordersToday:
			ordersTodayResult.count ?? 0,

		unpaidOrders:
			unpaidOrdersResult.count ?? 0,

		paidOrdersToday:
			paidOrdersTodayResult.count ?? 0,

		todayRevenue,

		todayOrderValue
	};
}

const QUERY_PAGE_SIZE = 1000;
const ORDER_ID_CHUNK_SIZE = 100;

type RevenueChartPeriod =
	| "week"
	| "month";

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

type ServiceMixDataPoint = {
	serviceId: string;
	serviceName: string;
	value: number;
};

type ServiceMixPeriodData = {
	revenue: ServiceMixDataPoint[];
	selections: ServiceMixDataPoint[];
};

type ServiceValueMaps = Record<
	RevenueChartPeriod,
	Map<string, ServiceValue>
>;

type ServiceMixData = Record<
	RevenueChartPeriod,
	ServiceMixPeriodData
>;

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

	if (
		dateKey >= weekStart &&
		dateKey <= today
	) {
		periods.push("week");
	}

	if (
		dateKey >= monthStart &&
		dateKey <= today
	) {
		periods.push("month");
	}

	return periods;
}

function addServiceValue(
	map: Map<string, ServiceValue>,
	item: RawOrderItem,
	value: number
) {
	if (
		!Number.isFinite(value) ||
		value <= 0
	) {
		return;
	}

	const serviceId =
		item.service_id ||
		item.service_name;

	const current =
		map.get(serviceId);

	map.set(serviceId, {
		serviceId,
		serviceName:
			item.service_name,

		value:
			(current?.value ?? 0) +
			value
	});
}

function toDataPoints(
	map: Map<string, ServiceValue>
): ServiceMixDataPoint[] {
	return Array.from(map.values())
		.sort(
			(first, second) =>
				second.value -
				first.value
		)
		.map((item) => ({
			serviceId:
				item.serviceId,
			serviceName:
				item.serviceName,
			value: item.value
		}));
}

const PAYMENT_PAGE_SIZE = 1000;

type RawRevenuePayment = {
	amount: number | string;
	paid_at: string;
};

type RevenueDataPoint = {
	date: string;
	amount: number;
};

type RevenueChartData = {
	week: RevenueDataPoint[];
	month: RevenueDataPoint[];
};

function createEmptySeries(
	startDate: string,
	endDate: string
): RevenueDataPoint[] {
	const series: RevenueDataPoint[] = [];
	let currentDate = startDate;

	while (currentDate <= endDate) {
		series.push({
			date: currentDate,
			amount: 0
		});

		currentDate =
			addDays(currentDate, 1);
	}

	return series;
}

function applyPaymentsToSeries(
	series: RevenueDataPoint[],
	paymentsByDate: Map<string, number>
) {
	return series.map((point) => ({
		...point,
		amount:
			paymentsByDate.get(
				point.date
			) ?? 0
	}));
}

export async function getServiceMixData(
	accessToken: string
): Promise<ServiceMixData> {
	const supabase =
		createUserSupabase(accessToken);

	const today =
		getVietnamDateKey(new Date());

	const weekStart =
		addDays(today, -6);

	const monthStart =
		`${today.slice(0, 7)}-01`;

	const queryStart =
		weekStart < monthStart
			? weekStart
			: monthStart;

	const queryEnd =
		addDays(today, 1);

	const payments: RawPayment[] = [];
	const orders: RawOrder[] = [];

	// Lấy payments
	for (
		let from = 0;
		;
		from += QUERY_PAGE_SIZE
	) {
		const { data, error } =
			await supabase
				.from("payments")
				.select(
					"order_id, amount, paid_at"
				)
				.gte(
					"paid_at",
					toVietnamDayBoundary(
						queryStart
					)
				)
				.lt(
					"paid_at",
					toVietnamDayBoundary(
						queryEnd
					)
				)
				.order("paid_at", {
					ascending: true
				})
				.range(
					from,
					from +
						QUERY_PAGE_SIZE -
						1
				);

		if (error) {
			throw error;
		}

		const page =
			(data ?? []) as RawPayment[];

		payments.push(...page);

		if (
			page.length <
			QUERY_PAGE_SIZE
		) {
			break;
		}
	}

	// Lấy orders
	for (
		let from = 0;
		;
		from += QUERY_PAGE_SIZE
	) {
		const { data, error } =
			await supabase
				.from("orders")
				.select("id, created_at")
				.gte(
					"created_at",
					toVietnamDayBoundary(
						queryStart
					)
				)
				.lt(
					"created_at",
					toVietnamDayBoundary(
						queryEnd
					)
				)
				.neq(
					"status",
					"cancelled"
				)
				.order("created_at", {
					ascending: true
				})
				.range(
					from,
					from +
						QUERY_PAGE_SIZE -
						1
				);

		if (error) {
			throw error;
		}

		const page =
			(data ?? []) as RawOrder[];

		orders.push(...page);

		if (
			page.length <
			QUERY_PAGE_SIZE
		) {
			break;
		}
	}

	const orderIds = Array.from(
		new Set([
			...payments.map(
				(payment) =>
					payment.order_id
			),
			...orders.map(
				(order) => order.id
			)
		])
	);

	const orderItems: RawOrderItem[] = [];

	// Lấy order_items theo từng nhóm order id
	for (
		let start = 0;
		start < orderIds.length;
		start += ORDER_ID_CHUNK_SIZE
	) {
		const idChunk =
			orderIds.slice(
				start,
				start +
					ORDER_ID_CHUNK_SIZE
			);

		for (
			let from = 0;
			;
			from += QUERY_PAGE_SIZE
		) {
			const { data, error } =
				await supabase
					.from("order_items")
					.select(`
						order_id,
						service_id,
						service_name,
						line_total
					`)
					.in(
						"order_id",
						idChunk
					)
					.order("order_id", {
						ascending: true
					})
					.range(
						from,
						from +
							QUERY_PAGE_SIZE -
							1
					);

			if (error) {
				throw error;
			}

			const page =
				(data ??
					[]) as RawOrderItem[];

			orderItems.push(...page);

			if (
				page.length <
				QUERY_PAGE_SIZE
			) {
				break;
			}
		}
	}

	const itemsByOrder =
		new Map<
			string,
			RawOrderItem[]
		>();

	for (const item of orderItems) {
		const items =
			itemsByOrder.get(
				item.order_id
			) ?? [];

		items.push(item);

		itemsByOrder.set(
			item.order_id,
			items
		);
	}

	const revenueMaps =
		createValueMaps();

	const selectionMaps =
		createValueMaps();

	// Tính doanh thu theo service
	for (const payment of payments) {
		const paymentAmount =
			Number(payment.amount);

		const paidAt =
			new Date(payment.paid_at);

		const items =
			(
				itemsByOrder.get(
					payment.order_id
				) ?? []
			).filter(
				(item) =>
					Number(
						item.line_total
					) > 0
			);

		const orderTotal =
			items.reduce(
				(total, item) =>
					total +
					Number(
						item.line_total
					),
				0
			);

		if (
			!Number.isFinite(
				paymentAmount
			) ||
			paidAt.toString() ===
				"Invalid Date" ||
			orderTotal <= 0
		) {
			continue;
		}

		const periods =
			getPeriodsForDate(
				getVietnamDateKey(
					paidAt
				),
				weekStart,
				monthStart,
				today
			);

		for (const item of items) {
			const allocatedRevenue =
				paymentAmount *
				(
					Number(
						item.line_total
					) /
					orderTotal
				);

			for (
				const period of periods
			) {
				addServiceValue(
					revenueMaps[
						period
					],
					item,
					allocatedRevenue
				);
			}
		}
	}

	// Tính số lần service được chọn
	for (const order of orders) {
		const createdAt =
			new Date(
				order.created_at
			);

		if (
			createdAt.toString() ===
			"Invalid Date"
		) {
			continue;
		}

		const periods =
			getPeriodsForDate(
				getVietnamDateKey(
					createdAt
				),
				weekStart,
				monthStart,
				today
			);

		const selectedServices =
			new Map<
				string,
				RawOrderItem
			>();

		for (
			const item of
			itemsByOrder.get(
				order.id
			) ?? []
		) {
			selectedServices.set(
				item.service_id ||
					item.service_name,
				item
			);
		}

		for (
			const item of
			selectedServices.values()
		) {
			for (
				const period of periods
			) {
				addServiceValue(
					selectionMaps[
						period
					],
					item,
					1
				);
			}
		}
	}

	return {
		week: {
			revenue:
				toDataPoints(
					revenueMaps.week
				),
			selections:
				toDataPoints(
					selectionMaps.week
				)
		},

		month: {
			revenue:
				toDataPoints(
					revenueMaps.month
				),
			selections:
				toDataPoints(
					selectionMaps.month
				)
		}
	};
}

export async function getRevenueChartData(
	accessToken: string
): Promise<RevenueChartData> {
	const supabase =
		createUserSupabase(accessToken);

	const today =
		getVietnamDateKey(new Date());

	const weekStart =
		addDays(today, -6);

	const monthStart =
		`${today.slice(0, 7)}-01`;

	const queryStart =
		weekStart < monthStart
			? weekStart
			: monthStart;

	const queryEnd =
		addDays(today, 1);

	const emptyData: RevenueChartData = {
		week: createEmptySeries(
			weekStart,
			today
		),
		month: createEmptySeries(
			monthStart,
			today
		)
	};

	const payments:
		RawRevenuePayment[] = [];

	for (
		let from = 0;
		;
		from += PAYMENT_PAGE_SIZE
	) {
		const { data, error } =
			await supabase
				.from("payments")
				.select(
					"amount, paid_at"
				)
				.gte(
					"paid_at",
					toVietnamDayBoundary(
						queryStart
					)
				)
				.lt(
					"paid_at",
					toVietnamDayBoundary(
						queryEnd
					)
				)
				.order("paid_at", {
					ascending: true
				})
				.range(
					from,
					from +
						PAYMENT_PAGE_SIZE -
						1
				);

		if (error) {
			throw error;
		}

		const page =
			(data ??
				[]) as RawRevenuePayment[];

		payments.push(...page);

		if (
			page.length <
			PAYMENT_PAGE_SIZE
		) {
			break;
		}
	}

	const paymentsByDate =
		new Map<string, number>();

	for (const payment of payments) {
		const paidAt =
			new Date(payment.paid_at);

		const amount =
			Number(payment.amount);

		if (
			Number.isNaN(
				paidAt.getTime()
			) ||
			!Number.isFinite(amount)
		) {
			continue;
		}

		const dateKey =
			getVietnamDateKey(paidAt);

		const currentAmount =
			paymentsByDate.get(
				dateKey
			) ?? 0;

		paymentsByDate.set(
			dateKey,
			currentAmount + amount
		);
	}

	return {
		week: applyPaymentsToSeries(
			emptyData.week,
			paymentsByDate
		),

		month: applyPaymentsToSeries(
			emptyData.month,
			paymentsByDate
		)
	};
}

