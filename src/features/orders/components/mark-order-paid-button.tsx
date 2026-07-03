"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/constants/payment-method";
import { markOrderAsPaid } from "@/features/orders/services/mark-order-as-paid";

type MarkOrderPaidButtonProps = {
	orderId: string;
	amount: number;
};

export function MarkOrderPaidButton({ orderId, amount }: MarkOrderPaidButtonProps) {
	const router = useRouter();

	const [method, setMethod] = useState<PaymentMethod>("cash");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleMarkAsPaid() {
		try {
			setIsLoading(true);
			setError("");

			await markOrderAsPaid({
				orderId,
				amount,
				method
			});

			router.refresh();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Cập nhật thanh toán thất bại.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-end gap-2">
			<div className="flex items-center gap-2">
				<select
					value={method}
					onChange={(event) => setMethod(event.target.value as PaymentMethod)}
					className="border-input bg-background h-9 rounded-md border px-2 text-sm"
					disabled={isLoading}
				>
					<option value="cash">{PAYMENT_METHOD_LABEL.cash}</option>
					<option value="bank_transfer">{PAYMENT_METHOD_LABEL.bank_transfer}</option>
					<option value="other">{PAYMENT_METHOD_LABEL.other}</option>
				</select>

				<Button type="button" size="sm" onClick={handleMarkAsPaid} disabled={isLoading}>
					{isLoading ? "Đang cập nhật..." : "Đã thanh toán"}
				</Button>
			</div>

			{error ? <p className="text-destructive text-xs">{error}</p> : null}
		</div>
	);
}
