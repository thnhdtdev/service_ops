export const PAYMENT_STATUS = {
	UNPAID: "unpaid",
	PAID: "paid"
} as const;

export const PAYMENT_STATUS_LABEL = {
	unpaid: "Chưa thanh toán",
	paid: "Đã thanh toán"
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABEL;
