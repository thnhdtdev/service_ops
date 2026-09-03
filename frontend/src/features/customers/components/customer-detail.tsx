"use client";

import Link from "next/link";
import {
	CalendarDays,
	Phone,
	ReceiptText,
	WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
	PAYMENT_METHOD_LABEL,
	type PaymentMethod
} from "@/constants/payment-method";

import {
	PAYMENT_STATUS_LABEL
} from "@/constants/payment-status";

import {
	SERVICE_UNIT_LABEL
} from "@/constants/service-unit";

import {
	formatCurrency,
	formatTime
} from "@/lib/format";

import {
	useCustomer
} from "@/features/customers/hooks/use-customer";

type CustomerDetailProps = {
	customerId: string;
};

function formatPhone(phone: string | null) {
	if (!phone) {
		return "Chưa có số điện thoại";
	}

	const digits = phone.replace(/\D/g, "");

	if (
		digits.length === 10 &&
		digits.startsWith("0")
	) {
		return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
	}

	return phone;
}

export function CustomerDetail({
	customerId
}: CustomerDetailProps) {
	const {
		data,
		isLoading,
		error
	} = useCustomer(customerId);

	if (isLoading) {
		return (
			<div className="text-muted-foreground py-12 text-center text-sm">
				Đang tải thông tin khách hàng...
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="space-y-4">
				<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
					{error ||
						"Không tìm thấy khách hàng."}
				</div>

				<Button
					asChild
					variant="outline"
				>
					<Link href="/customers">
						Quay lại danh bạ
					</Link>
				</Button>
			</div>
		);
	}

	const {
		customer,
		orders,
		stats
	} = data;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-muted-foreground text-sm">
						Hồ sơ khách hàng
					</p>

					<h1 className="text-2xl font-bold tracking-tight">
						{customer.name}
					</h1>

					<div className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
						<span className="flex items-center gap-2">
							<Phone className="size-4" />
							{formatPhone(customer.phone)}
						</span>

						<span className="flex items-center gap-2">
							<CalendarDays className="size-4" />
							Khách từ{" "}
							{formatTime(customer.created_at)}
						</span>
					</div>
				</div>

				<Button
					asChild
					variant="outline"
				>
					<Link href="/customers">
						Quay lại
					</Link>
				</Button>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<ReceiptText className="text-primary size-5" />

					<p className="mt-5 text-2xl font-bold tabular-nums">
						{stats.order_count}
					</p>

					<p className="text-muted-foreground mt-1 text-sm">
						Tổng đơn hàng
					</p>
				</section>

				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<WalletCards className="text-warning size-5" />

					<p className="mt-5 text-2xl font-bold tabular-nums">
						{stats.unpaid_order_count}
					</p>

					<p className="text-muted-foreground mt-1 text-sm">
						Đơn chưa thanh toán
					</p>
				</section>

				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<p className="text-muted-foreground text-sm">
						Tổng giá trị đơn
					</p>

					<p className="mt-5 text-2xl font-bold tabular-nums">
						{formatCurrency(
							Number(
								stats.total_order_value
							)
						)}
					</p>
				</section>
			</div>

			{/* Customer info */}
			{customer.address ||
			customer.note ? (
				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<h2 className="font-semibold">
						Thông tin khách hàng
					</h2>

					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-sm">
								Địa chỉ
							</p>

							<p className="mt-1">
								{customer.address || "-"}
							</p>
						</div>

						<div>
							<p className="text-muted-foreground text-sm">
								Ghi chú
							</p>

							<p className="mt-1">
								{customer.note || "-"}
							</p>
						</div>
					</div>
				</section>
			) : null}

			{/* Order history */}
			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold">
						Lịch sử đơn hàng
					</h2>

					<p className="text-muted-foreground mt-1 text-sm">
						Tất cả đơn hàng đã tạo cho khách hàng này.
					</p>
				</div>

				{orders.length > 0 ? (
					<div className="space-y-4">
						{orders.map((order) => (
							<article
								key={order.id}
								className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
							>
								{/* Order header */}
								<header className="border-border flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
									<div>
										<Link
											href={`/orders/${order.id}`}
											className="hover:text-primary font-semibold transition-colors"
										>
											{order.order_code}
										</Link>

										<p className="text-muted-foreground mt-1 text-sm">
											{formatTime(
												order.created_at
											)}
										</p>
									</div>

									<div className="flex items-center gap-3">
										<Badge variant="outline">
											{
												PAYMENT_STATUS_LABEL[
													order.payment_status
												]
											}
										</Badge>

										<p className="font-bold tabular-nums">
											{formatCurrency(
												Number(
													order.total_amount
												)
											)}
										</p>

										<Button
											asChild
											variant="ghost"
											size="sm"
										>
											<Link
												href={`/orders/${order.id}`}
											>
												Xem đơn
											</Link>
										</Button>
									</div>
								</header>

								{/* Items */}
								<div className="overflow-x-auto">
									<table className="w-full min-w-160 text-sm">
										<thead>
											<tr className="bg-muted/40 text-muted-foreground text-left">
												<th className="px-5 py-2.5 font-medium">
													Dịch vụ
												</th>

												<th className="px-5 py-2.5 font-medium">
													Số lượng
												</th>

												<th className="px-5 py-2.5 font-medium">
													Đơn giá
												</th>

												<th className="px-5 py-2.5 text-right font-medium">
													Thành tiền
												</th>
											</tr>
										</thead>

										<tbody>
											{order.items.map(
												(item) => (
													<tr
														key={item.id}
														className="border-border border-t first:border-t-0"
													>
														<td className="px-5 py-3">
															<p className="font-medium">
																{
																	item.service_name
																}
															</p>

															<p className="text-muted-foreground mt-0.5 text-xs">
																{SERVICE_UNIT_LABEL[
																	item.unit as keyof typeof SERVICE_UNIT_LABEL
																] ??
																	item.unit}
															</p>
														</td>

														<td className="px-5 py-3 tabular-nums">
															{
																item.quantity
															}
														</td>

														<td className="px-5 py-3 tabular-nums">
															{formatCurrency(
																Number(
																	item.unit_price
																)
															)}
														</td>

														<td className="px-5 py-3 text-right font-medium tabular-nums">
															{formatCurrency(
																Number(
																	item.line_total
																)
															)}
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>

								{/* Payments */}
								{order.payments.length > 0 ? (
									<div className="border-border bg-muted/20 border-t px-5 py-3">
										<p className="text-muted-foreground text-xs font-medium">
											Thanh toán
										</p>

										<div className="mt-2 space-y-1">
											{order.payments.map(
												(payment) => (
													<div
														key={
															payment.id
														}
														className="flex flex-wrap items-center justify-between gap-2 text-sm"
													>
														<span>
															{PAYMENT_METHOD_LABEL[
																payment.method as PaymentMethod
															] ??
																payment.method}
														</span>

														<span className="font-medium tabular-nums">
															{formatCurrency(
																Number(
																	payment.amount
																)
															)}
														</span>
													</div>
												)
											)}
										</div>
									</div>
								) : null}
							</article>
						))}
					</div>
				) : (
					<div className="border-border bg-card text-muted-foreground rounded-2xl border px-5 py-12 text-center text-sm">
						Khách hàng chưa có đơn hàng.
					</div>
				)}
			</section>
		</div>
	);
}