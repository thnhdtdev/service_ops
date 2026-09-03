"use client";

import { useState } from "react";
import {
	Banknote,
	CircleAlert,
	CircleCheck,
	Landmark,
	LoaderCircle,
	WalletCards
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/constants/payment-method";
import { markOrderAsPaid } from "@/features/orders/services/mark-order-as-paid";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type MarkOrderPaidButtonProps = {
	orderId: string;
	orderCode: string;
	customerName: string;
	amount: number;
	onSuccess?: () => void;
};

const PAYMENT_METHOD_OPTIONS = [
	{
		value: "cash",
		label: PAYMENT_METHOD_LABEL.cash,
		icon: Banknote
	},
	{
		value: "bank_transfer",
		label: PAYMENT_METHOD_LABEL.bank_transfer,
		icon: Landmark
	},
	{
		value: "other",
		label: PAYMENT_METHOD_LABEL.other,
		icon: WalletCards
	}
] satisfies Array<{
	value: PaymentMethod;
	label: string;
	icon: typeof Banknote;
}>;

export function MarkOrderPaidButton({
	orderId,
	orderCode,
	customerName,
	amount,
	onSuccess
}: MarkOrderPaidButtonProps) {
	const router = useRouter();
	const { showSuccessToast } = useToast();

	const [open, setOpen] = useState(false);
	const [method, setMethod] = useState<PaymentMethod>("cash");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleMarkAsPaid() {
		try {
			setIsLoading(true);
			setError("");

			await markOrderAsPaid(orderId, method);

			setOpen(false);
			showSuccessToast({
				title: "Đã ghi nhận thanh toán",
				description: `${formatCurrency(amount)} bằng ${PAYMENT_METHOD_LABEL[method]} cho đơn ${orderCode}.`
			});

			onSuccess?.();
			router.refresh();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Cập nhật thanh toán thất bại.");
		} finally {
			setIsLoading(false);
		}
	}

	function handleOpenChange(nextOpen: boolean) {
		if (isLoading) return;

		setOpen(nextOpen);

		if (!nextOpen) {
			setError("");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="border-primary/25 text-primary hover:bg-primary/10 hover:text-primary"
				>
					<WalletCards aria-hidden="true" data-icon="inline-start" />
					Thu tiền
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
				<DialogHeader className="pr-8">
					<div className="flex items-start gap-3">
						<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
							<WalletCards aria-hidden="true" className="size-5" strokeWidth={1.8} />
						</div>
						<div className="min-w-0">
							<DialogTitle>Thu tiền đơn hàng</DialogTitle>
							<DialogDescription className="mt-1.5">
								Đơn <span className="text-foreground font-medium">{orderCode}</span>{" "}
								của{" "}
								<span className="text-foreground font-medium">{customerName}</span>.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						void handleMarkAsPaid();
					}}
					aria-busy={isLoading}
				>
					<div className="space-y-5">
						<div className="border-primary/15 bg-primary/5 rounded-lg border px-4 py-3.5">
							<p className="text-muted-foreground text-xs font-medium">
								Số tiền cần thu
							</p>
							<p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight tabular-nums">
								{formatCurrency(amount)}
							</p>
						</div>

						<fieldset disabled={isLoading}>
							<legend className="mb-2 text-sm font-medium">
								Phương thức thanh toán
							</legend>
							<div className="space-y-2">
								{PAYMENT_METHOD_OPTIONS.map((option) => {
									const Icon = option.icon;
									const inputId = `payment-method-${orderId}-${option.value}`;
									const isSelected = method === option.value;

									return (
										<div key={option.value} className="relative">
											<input
												id={inputId}
												name={`payment-method-${orderId}`}
												type="radio"
												value={option.value}
												checked={isSelected}
												onChange={() => setMethod(option.value)}
												className="peer sr-only"
											/>
											<label
												htmlFor={inputId}
												className={cn(
													"border-input hover:bg-muted/50 peer-focus-visible:ring-ring/50 flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors peer-focus-visible:ring-3 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
													isSelected && "border-primary/40 bg-primary/5"
												)}
											>
												<span
													className={cn(
														"bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md",
														isSelected && "bg-primary/10 text-primary"
													)}
												>
													<Icon
														aria-hidden="true"
														className="size-4"
														strokeWidth={1.8}
													/>
												</span>
												<span className="flex-1 font-medium">
													{option.label}
												</span>
												<CircleCheck
													aria-hidden="true"
													className={cn(
														"text-primary size-4 opacity-0 transition-opacity",
														isSelected && "opacity-100"
													)}
												/>
											</label>
										</div>
									);
								})}
							</div>
						</fieldset>

						{error ? (
							<div
								role="alert"
								className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
							>
								<CircleAlert
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0"
								/>
								<p>{error}</p>
							</div>
						) : null}
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							disabled={isLoading}
							onClick={() => handleOpenChange(false)}
						>
							Hủy
						</Button>
						<Button type="submit" className="min-w-40" disabled={isLoading}>
							{isLoading ? (
								<LoaderCircle
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<CircleCheck aria-hidden="true" data-icon="inline-start" />
							)}
							{isLoading ? "Đang ghi nhận..." : "Xác nhận thu tiền"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
