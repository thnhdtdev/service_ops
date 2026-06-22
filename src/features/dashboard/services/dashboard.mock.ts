import type { AttentionOrder, DashboardStats } from "../types";

export const dashboardStatsMock: DashboardStats = {
	ordersToday: 24,
	processingOrders: 6,
	completedOrders: 12,
	unpaidOrders: 3,
	todayRevenue: 2480000
};

export const attentionOrdersMock: AttentionOrder[] = [
	{
		id: "1",
		orderCode: "SO-20260618-001",
		customerName: "Chị Linh",
		serviceSummary: "Giặt sấy 5kg",
		status: "processing",
		paymentStatus: "unpaid",
		totalAmount: 75000,
		dueAt: "2026-06-18T18:00:00.000Z"
	},
	{
		id: "2",
		orderCode: "SO-20260618-002",
		customerName: "Anh Minh",
		serviceSummary: "Vệ sinh 2 đôi giày",
		status: "completed",
		paymentStatus: "paid",
		totalAmount: 120000,
		dueAt: "2026-06-18T17:00:00.000Z"
	}
];
