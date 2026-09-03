export type CustomerSummary = {
	id: string;
	name: string;
	phone: string | null;
};

export type CustomerDirectoryItem = CustomerSummary & {
	createdAt: string;
	orderCount: number;
	unpaidOrderCount: number;
	lastOrderAt: string | null;
	totalOrderValue: number;
};

export type CustomerDirectory = {
	customers: CustomerDirectoryItem[];
	matchingCustomerCount: number;
	totalCustomerCount: number;
	newCustomerCountThisMonth: number;
	isLimited: boolean;
};

export type CustomerOrderItem = {
	serviceName: string;
	unit: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
};

export type CustomerOrderPayment = {
	amount: number;
	method: string;
	paidAt: string;
};

export type CustomerOrderHistoryItem = {
	id: string;
	orderCode: string;
	customerName: string;
	customerPhone: string | null;
	status: string;
	paymentStatus: string;
	totalAmount: number;
	dueAt: string | null;
	note: string | null;
	createdAt: string;
	items: CustomerOrderItem[];
	payments: CustomerOrderPayment[];
};

export type CustomerDetail = {
	customer: CustomerSummary & {
		createdAt: string;
	};
	orders: CustomerOrderHistoryItem[];
	totalOrderCount: number;
	unpaidOrderCount: number;
	lastOrderAt: string | null;
	page: number;
	totalPages: number;
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
