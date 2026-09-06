import type { ServiceUnit } from "@/constants/service-unit";
import type { OrderStatus } from "@/constants/order-status";
import type { PaymentStatus } from "@/constants/payment-status";

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
	discountType: "percent" | "fixed";
	discountValue: number;
	paymentMethod: "cash" | "bank_transfer" | "other";
	items: {
		serviceId: string;
		quantity: number;
	}[];
};

export type OrderListItem = {
	id: string;
	order_code: string;
	customer_id: string | null;
	customer_name: string;
	customer_phone: string | null;
	status: OrderStatus;
	payment_status: PaymentStatus;

	subtotal: number;
	discount_type: "percent" | "fixed" | null;
	discount_value: number;
	discount_amount: number;
	total_amount: number;

	due_at: string | null;
	note: string | null;
	created_by: string | null;
	created_at: string;
	updated_at: string;
};

export type OrdersPagination = {
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
};

export type GetOrdersResponse = {
	orders: OrderListItem[];
	pagination: OrdersPagination;
};

export type GetOrdersParams = {
	page?: number;
	pageSize?: number;
	status?: OrderStatus;
	paymentStatus?: PaymentStatus;
};

export type OrderItemDetail = {
	id: string;
	order_id: string;
	service_id: string | null;
	service_name: string;
	unit: string;
	quantity: number;
	unit_price: number;
	line_total: number;
	note: string | null;
	created_at: string;
};

export type OrderPayment = {
	id: string;
	order_id: string;
	amount: number;
	method: string;
	paid_at: string;
	created_by: string | null;
	created_at: string;
};

export type OrderCustomer = {
	id: string;
	name: string;
	phone: string | null;
	normalized_phone: string | null;
	address: string | null;
	note: string | null;
	created_at: string;
	updated_at: string;
};

export type GetOrderResponse = {
	order: OrderListItem;
	items: OrderItemDetail[];
	payments: OrderPayment[];
	customer: OrderCustomer | null;
};
