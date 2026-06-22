import type { ServiceUnit } from "@/constants/service-unit";

export type Service = {
	id: string;
	name: string;
	unit: ServiceUnit;
	unit_price: number;
	description: string | null;
	is_active: boolean;
};

export type CreateOrderFormValues = {
	customerName: string;
	customerPhone: string;
	dueAt: string;
	note: string;
	paymentStatus: "unpaid" | "paid";
	paymentMethod: "cash" | "bank_transfer" | "other";
	items: {
		serviceId: string;
		quantity: number;
	}[];
};

export type DashboardStats = {
	ordersToday: number;
	processingOrders: number;
	completedOrders: number;
	unpaidOrders: number;
	todayRevenue: number;
  };