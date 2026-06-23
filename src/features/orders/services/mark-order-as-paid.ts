import type { PaymentMethod } from "@/constants/payment-method";
import { createClient } from "@/lib/supabase/client";

type MarkOrderAsPaidParams = {
	orderId: string;
	amount: number;
	method: PaymentMethod;
};

export async function markOrderAsPaid({ orderId, amount, method }: MarkOrderAsPaidParams) {
	const supabase = createClient();

	const paidAt = new Date().toISOString();

	const { error: orderError } = await supabase
		.from("orders")
		.update({
			payment_status: "paid",
			updated_at: paidAt
		})
		.eq("id", orderId)
		.eq("payment_status", "unpaid");

	if (orderError) {
		throw new Error("Không thể cập nhật trạng thái thanh toán.");
	}

	const { error: paymentError } = await supabase.from("payments").insert({
		order_id: orderId,
		amount,
		method,
		paid_at: paidAt
	});

	if (paymentError) {
		throw new Error("Không thể ghi nhận thanh toán.");
	}
}
