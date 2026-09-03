import type {
	OrderItemDetail,
	OrderListItem,
	OrderPayment
} from "@/features/orders/type";

export type CustomerSummary = {
	id: string;
	name: string;
	phone: string | null;
};

export type CustomerListItem = {
	id: string;
	name: string;
	phone: string | null;
	normalized_phone: string | null;
	address: string | null;
	note: string | null;
	created_at: string;
	updated_at: string;

	order_count: number;
	unpaid_order_count: number;
	last_order_at: string | null;
	total_order_value: number;
};

export type CustomersPagination = {
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
};

export type GetCustomersResponse = {
	customers: CustomerListItem[];

	stats: {
		total_customer_count: number;
		new_customer_count_this_month: number;
	};

	pagination: CustomersPagination;
};

export type GetCustomersParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type CustomerDetailInfo = {
	id: string;
	name: string;
	phone: string | null;
	normalized_phone: string | null;
	address: string | null;
	note: string | null;
	created_at: string;
	updated_at: string;
};

export type CustomerOrderHistoryItem =
	OrderListItem & {
		items: OrderItemDetail[];
		payments: OrderPayment[];
	};

export type CustomerDetailStats = {
	order_count: number;
	unpaid_order_count: number;
	total_order_value: number;
};

export type GetCustomerResponse = {
	customer: CustomerDetailInfo;
	orders: CustomerOrderHistoryItem[];
	stats: CustomerDetailStats;
};