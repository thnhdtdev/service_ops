"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

import {
	PAYMENT_METHOD_LABEL,
	type PaymentMethod
} from "@/constants/payment-method";

import { formatCurrency } from "@/lib/format";

import { markOrderAsPaid } from "@/features/orders/services/mark-order-as-paid";

type MarkOrderPaidButtonProps = {
	orderId: string;
	amount: number;
	onSuccess?: () => void;
};

export function MarkOrderPaidButton({
	orderId,
	amount,
	onSuccess
}: MarkOrderPaidButtonProps) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [method, setMethod] =
		useState<PaymentMethod>("cash");

	const [isLoading, setIsLoading] =
		useState(false);

	const [error, setError] =
		useState("");

	async function handleMarkAsPaid() {
		try {
			setIsLoading(true);
			setError("");

			await markOrderAsPaid(
				orderId,
				method
			);

			setOpen(false);

			onSuccess?.();
			router.refresh();
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Cập nhật thanh toán thất bại."
			);
		} finally {
			setIsLoading(false);
		}
	}

	function handleOpenChange(nextOpen: boolean) {
		if (isLoading) {
			return;
		}

		setOpen(nextOpen);

		if (!nextOpen) {
			setError("");
		}
	}

	return (
		<>
			<Button
				type="button"
				size="sm"
				onClick={() => setOpen(true)}
			>
				Thu tiền
			</Button>

			<Dialog
				open={open}
				onOpenChange={handleOpenChange}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Ghi nhận thanh toán
						</DialogTitle>

						<DialogDescription>
							Xác nhận khách hàng đã thanh toán đơn hàng này.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-5 py-2">
						<div className="bg-muted rounded-xl p-4">
							<p className="text-muted-foreground text-sm">
								Số tiền cần thu
							</p>

							<p className="mt-1 text-2xl font-bold tabular-nums">
								{formatCurrency(amount)}
							</p>
						</div>

						<div className="space-y-2">
							<label
								htmlFor={`payment-method-${orderId}`}
								className="text-sm font-medium"
							>
								Phương thức thanh toán
							</label>

							<select
								id={`payment-method-${orderId}`}
								value={method}
								onChange={(event) =>
									setMethod(
										event.target.value as PaymentMethod
									)
								}
								disabled={isLoading}
								className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
							>
								<option value="cash">
									{PAYMENT_METHOD_LABEL.cash}
								</option>

								<option value="bank_transfer">
									{PAYMENT_METHOD_LABEL.bank_transfer}
								</option>

								<option value="other">
									{PAYMENT_METHOD_LABEL.other}
								</option>
							</select>
						</div>

						{error ? (
							<p className="text-destructive text-sm">
								{error}
							</p>
						) : null}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isLoading}
							onClick={() => setOpen(false)}
						>
							Hủy
						</Button>

						<Button
							type="button"
							disabled={isLoading}
							onClick={handleMarkAsPaid}
						>
							{isLoading
								? "Đang ghi nhận..."
								: "Xác nhận thanh toán"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}