export const ORDER_STATUS = {
	RECEIVED: "received",
	PROCESSING: "processing",
	COMPLETED: "completed",
	DELIVERED: "delivered",
	CANCELLED: "cancelled"
} as const;

export const ORDER_STATUS_LABEL = {
	received: "Mới nhận",
	processing: "Đang xử lý",
	completed: "Đã xong",
	delivered: "Đã trả khách",
	cancelled: "Đã hủy"
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;
