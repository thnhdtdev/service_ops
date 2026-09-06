export const PAYMENT_STATUS = {
	UNPAID: "unpaid",
	PARTIAL: "partial",
	PAID: "paid"
} as const;

export const PAYMENT_STATUS_LABEL = {
	unpaid: "Chưa thanh toán",
	partial: "Thanh toán một phần",
	paid: "Đã thanh toán"
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABEL;
