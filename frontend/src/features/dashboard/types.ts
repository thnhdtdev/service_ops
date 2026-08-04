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

export type AttentionOrder = {
	id: string;
	orderCode: string;
	customerName: string;
	serviceSummary: string;
	paymentStatus: PaymentStatus;
	totalAmount: number;
	dueAt: string | null;
};
