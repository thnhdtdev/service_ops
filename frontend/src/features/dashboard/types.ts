// What the staff account receives: order counts only, no money.
export type StaffDashboardStats = {
	ordersToday: number;
	unpaidOrders: number;
};

// What an admin receives: the counts plus revenue.
export type DashboardStats = StaffDashboardStats & {
	ordersWithPaymentToday: number;
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
