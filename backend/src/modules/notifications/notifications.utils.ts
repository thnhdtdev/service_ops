import type { PushNotificationPayload } from "./notifications.schema.js";

// Same labels as PAYMENT_METHOD_LABEL in the frontend.
const PAYMENT_METHOD_LABEL: Record<string, string> = {
	cash: "Tiền mặt",
	bank_transfer: "Chuyển khoản",
	other: "Khác"
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
	style: "currency",
	currency: "VND"
});

export type PaymentNotificationInput = {
	orderId: string;
	orderCode: string;
	customerName: string;
	amount: number;
	method: string;
	// Used as the tag, so the same payment never shows twice.
	paymentKey: string;
};

// e.g. title "Đã nhận 200.000 ₫", body "Tiền mặt · SB-031126-004 · Nguyễn Văn A"
export function buildPaymentNotification(
	input: PaymentNotificationInput
): PushNotificationPayload {
	const methodLabel =
		PAYMENT_METHOD_LABEL[input.method] ?? input.method;

	return {
		title: `Đã nhận ${currencyFormatter.format(input.amount)}`,
		body: `${methodLabel} · ${input.orderCode} · ${input.customerName}`,
		url: `/orders/${input.orderId}`,
		tag: `payment-${input.paymentKey}`
	};
}
