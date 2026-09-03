import type { PaymentStatus } from "@/constants/payment-status";

export type DashboardStats = {
	ordersToday: number;
	unpaidOrders: number;
	paidOrdersToday: number;
	todayRevenue: number;
	todayOrderValue: number;
};

export type RevenueChartPeriod = "week" | "month";

export type RevenueDataPoint = {
	date: string;
	amount: number;
};

export type RevenueChartData = Record<RevenueChartPeriod, RevenueDataPoint[]>;

export type ServiceMixMetric = "revenue" | "selections";

export type ServiceMixDataPoint = {
	serviceId: string;
	serviceName: string;
	value: number;
};

export type ServiceMixData = Record<
	RevenueChartPeriod,
	Record<ServiceMixMetric, ServiceMixDataPoint[]>
>;
