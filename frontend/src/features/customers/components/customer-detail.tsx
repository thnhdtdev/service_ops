"use client";

import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	CalendarDays,
	CircleAlert,
	Clock3,
	MapPin,
	Phone,
	ReceiptText,
	RotateCcw,
	StickyNote,
	UserRound,
	WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/constants/order-status";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment-method";
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/constants/payment-status";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import type { CustomerOrderHistoryItem } from "@/features/customers/types";
import { MarkOrderPaidButton } from "@/features/orders/components/mark-order-paid-button";
import type { OrderPayment } from "@/features/orders/type";
import { formatCurrency } from "@/lib/format";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
	hour: "2-digit",
	minute: "2-digit",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

const numberFormatter = new Intl.NumberFormat("vi-VN", {
	maximumFractionDigits: 2
});

const paymentMethodLabels = PAYMENT_METHOD_LABEL as Record<string, string>;
const serviceUnitLabels = SERVICE_UNIT_LABEL as Record<string, string>;

type CustomerDetailProps = {
	customerId: string;
};

function formatDateTime(value: string | null, fallback = "Chưa cập nhật") {
	if (!value) return fallback;

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? "Không xác định" : dateTimeFormatter.format(date);
}

function formatPhone(phone: string | null) {
	if (!phone) return "Chưa có số điện thoại";

	const digits = phone.replace(/\D/g, "");

	if (digits.length === 10 && digits.startsWith("0")) {
		return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
	}

	return phone;
}

function getInitials(name: string) {
	const initials = name
		.trim()
		.split(/\s+/)
		.slice(-2)
		.map((part) => part.charAt(0).toLocaleUpperCase("vi-VN"))
		.join("");

	return initials || "KH";
}


function getPaymentStatusClassName(status: PaymentStatus) {
	return status === "paid"
		? "border-success/30 bg-success/10 text-success"
		: "border-warning/30 bg-warning/10 text-warning";
}

function getOrderItemSummary(order: CustomerOrderHistoryItem) {
	if (order.items.length === 0) return "Chưa có thông tin dịch vụ";

	const visibleItems = order.items.slice(0, 2).map((item) => {
		const unit = serviceUnitLabels[item.unit] ?? item.unit;

		return `${item.service_name} (${numberFormatter.format(item.quantity)} ${unit})`;
	});
	const remainingItemCount = order.items.length - visibleItems.length;

	return remainingItemCount > 0
		? `${visibleItems.join(", ")} và ${remainingItemCount} dịch vụ khác`
		: visibleItems.join(", ");
}

function getLatestPayment(payments: OrderPayment[]) {
	return payments.reduce<OrderPayment | null>((latest, payment) => {
		if (!latest || payment.paid_at > latest.paid_at) return payment;

		return latest;
	}, null);
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
	return (
		<Badge variant="outline" className={getPaymentStatusClassName(status)}>
			{PAYMENT_STATUS_LABEL[status]}
		</Badge>
	);
}

function BackToCustomersButton() {
	return (
		<Button asChild variant="ghost" size="sm" className="-ml-2">
			<Link href="/customers">
				<ArrowLeft aria-hidden="true" data-icon="inline-start" />
				Quay lại danh bạ
			</Link>
		</Button>
	);
}

function CustomerDetailSkeleton() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="animate-pulse space-y-6 motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải hồ sơ khách hàng...</span>
			<div aria-hidden="true" className="bg-muted h-8 w-36 rounded-md" />

			<div
				aria-hidden="true"
				className="border-border bg-card overflow-hidden rounded-2xl border"
			>
				<div className="flex items-center gap-4 p-5 sm:p-6">
					<div className="bg-muted size-14 rounded-xl" />
					<div className="min-w-0 flex-1 space-y-3">
						<div className="bg-muted h-6 w-48 max-w-full rounded-md" />
						<div className="bg-muted h-4 w-72 max-w-full rounded-md" />
					</div>
				</div>
				<div className="divide-border grid divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="space-y-2 px-5 py-4">
							<div className="bg-muted h-4 w-28 rounded-md" />
							<div className="bg-muted h-7 w-24 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="border-border bg-card overflow-hidden rounded-2xl border">
					<div className="border-border space-y-2 border-b px-5 py-4">
						<div className="bg-muted h-5 w-40 rounded-md" />
						<div className="bg-muted h-4 w-72 max-w-full rounded-md" />
					</div>
					<div className="divide-border divide-y">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="space-y-4 px-5 py-5">
								<div className="flex flex-wrap gap-2">
									<div className="bg-muted h-5 w-24 rounded-md" />
									<div className="bg-muted h-5 w-20 rounded-4xl" />
								</div>
								<div className="bg-muted h-4 w-4/5 rounded-md" />
								<div className="bg-muted h-4 w-3/5 rounded-md" />
							</div>
						))}
					</div>
				</div>
				<div className="border-border bg-card h-72 rounded-2xl border" />
			</div>
		</div>
	);
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
	const { data, isLoading, error, refetch } = useCustomer(customerId);

	if (isLoading) return <CustomerDetailSkeleton />;

	if (error || !data) {
		return (
			<div className="space-y-6">
				<BackToCustomersButton />

				<section className="border-destructive/25 bg-card rounded-2xl border p-6 sm:p-8">
					<div className="flex max-w-xl items-start gap-4">
						<div className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
							<CircleAlert aria-hidden="true" className="size-5" strokeWidth={1.8} />
						</div>
						<div>
							<h1 className="text-lg font-semibold">
								Không thể tải hồ sơ khách hàng
							</h1>
							<p className="text-muted-foreground mt-1 text-sm leading-6">
								{error || "Không tìm thấy khách hàng."}
							</p>
							<div className="mt-5 flex flex-wrap gap-2">
								<Button type="button" onClick={refetch}>
									<RotateCcw aria-hidden="true" data-icon="inline-start" />
									Thử lại
								</Button>
								<Button asChild variant="outline">
									<Link href="/customers">Về danh bạ</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</div>
		);
	}

	const { customer, orders, stats } = data;

	return (
		<div className="space-y-6">
			<BackToCustomersButton />

			<section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
				<div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
					<div className="flex min-w-0 items-center gap-4">
						<div
							aria-hidden="true"
							className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold"
						>
							{getInitials(customer.name)}
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground text-sm">Hồ sơ khách hàng</p>
							<h1 className="truncate text-2xl font-bold tracking-tight">
								{customer.name}
							</h1>
							<div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
								{customer.phone ? (
									<a
										href={`tel:${customer.phone}`}
										className="hover:text-primary inline-flex items-center gap-1.5 transition-colors"
									>
										<Phone
											aria-hidden="true"
											className="size-4"
											strokeWidth={1.8}
										/>
										{formatPhone(customer.phone)}
									</a>
								) : (
									<span className="inline-flex items-center gap-1.5">
										<Phone
											aria-hidden="true"
											className="size-4"
											strokeWidth={1.8}
										/>
										Chưa có số điện thoại
									</span>
								)}
								<span className="inline-flex items-center gap-1.5">
									<CalendarDays
										aria-hidden="true"
										className="size-4"
										strokeWidth={1.8}
									/>
									Khách từ {formatDateTime(customer.created_at)}
								</span>
							</div>
						</div>
					</div>

					{customer.phone ? (
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<a href={`tel:${customer.phone}`}>
								<Phone aria-hidden="true" data-icon="inline-start" />
								Gọi điện
							</a>
						</Button>
					) : null}
				</div>

				<dl className="divide-border grid divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
					<div className="flex flex-col px-5 py-4 sm:px-6">
						<dt className="text-muted-foreground order-2 mt-1 text-xs font-medium">
							Tổng đơn hàng
						</dt>
						<dd className="order-1 font-mono text-xl font-semibold tabular-nums">
							{stats.order_count}
						</dd>
					</div>
					<div className="flex flex-col px-5 py-4 sm:px-6">
						<dt className="text-muted-foreground order-2 mt-1 text-xs font-medium">
							Đơn chưa thanh toán
						</dt>
						<dd className="text-warning order-1 font-mono text-xl font-semibold tabular-nums">
							{stats.unpaid_order_count}
						</dd>
					</div>
					<div className="flex flex-col px-5 py-4 sm:px-6">
						<dt className="text-muted-foreground order-2 mt-1 text-xs font-medium">
							Tổng giá trị đơn
						</dt>
						<dd className="order-1 font-mono text-xl font-semibold tracking-tight tabular-nums">
							{formatCurrency(Number(stats.total_order_value))}
						</dd>
					</div>
				</dl>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
				<section className="border-border bg-card order-2 overflow-hidden rounded-2xl border shadow-sm lg:order-1">
					<header className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
						<div>
							<h2 className="font-semibold">Lịch sử đơn hàng</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Theo dõi dịch vụ, tiến độ và thanh toán của khách hàng.
							</p>
						</div>
						<p className="text-muted-foreground text-sm tabular-nums">
							{orders.length} đơn hàng
						</p>
					</header>

					{orders.length > 0 ? (
						<div className="divide-border divide-y">
							{orders.map((order) => {
								const latestPayment = getLatestPayment(order.payments);

								return (
									<article
										key={order.id}
										className="hover:bg-muted/25 px-5 py-5 transition-colors sm:px-6"
									>
										<div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<Link
														href={`/orders/${order.id}`}
														className="hover:text-primary font-semibold transition-colors"
													>
														{order.order_code}
													</Link>
													<PaymentStatusBadge
														status={order.payment_status}
													/>
												</div>

												<p className="mt-2 text-sm leading-6">
													{getOrderItemSummary(order)}
												</p>

												<div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
													<span className="inline-flex items-center gap-1.5">
														<CalendarDays
															aria-hidden="true"
															className="size-3.5"
															strokeWidth={1.8}
														/>
														Tạo lúc {formatDateTime(order.created_at)}
													</span>
													<span className="inline-flex items-center gap-1.5">
														<Clock3
															aria-hidden="true"
															className="size-3.5"
															strokeWidth={1.8}
														/>
														{order.due_at
															? `Hẹn trả ${formatDateTime(order.due_at)}`
															: "Chưa có ngày hẹn trả"}
													</span>
													{latestPayment ? (
														<span className="inline-flex items-center gap-1.5">
															<WalletCards
																aria-hidden="true"
																className="size-3.5"
																strokeWidth={1.8}
															/>
															Đã thu{" "}
															{formatDateTime(latestPayment.paid_at)}{" "}
															qua{" "}
															{paymentMethodLabels[
																latestPayment.method
															] ?? latestPayment.method}
														</span>
													) : null}
												</div>
											</div>

											<div className="flex shrink-0 flex-col gap-3 border-t pt-4 xl:min-w-52 xl:border-t-0 xl:pt-0 xl:text-right">
												<div>
													<p className="text-muted-foreground text-xs">
														Tổng tiền
													</p>
													<p className="mt-1 font-mono text-lg font-semibold tracking-tight tabular-nums">
														{formatCurrency(Number(order.total_amount))}
													</p>
												</div>
												<div className="flex flex-wrap gap-2 xl:justify-end">
													{order.payment_status === "unpaid" ? (
														<MarkOrderPaidButton
															orderId={order.id}
															orderCode={order.order_code}
															customerName={customer.name}
															amount={Number(order.total_amount)}
															onSuccess={refetch}
														/>
													) : null}
													<Button asChild variant="ghost" size="sm">
														<Link href={`/orders/${order.id}`}>
															Xem đơn
															<ArrowRight
																aria-hidden="true"
																data-icon="inline-end"
															/>
														</Link>
													</Button>
												</div>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					) : (
						<div className="px-5 py-14 text-center sm:px-6">
							<div className="bg-muted text-muted-foreground mx-auto flex size-11 items-center justify-center rounded-xl">
								<ReceiptText
									aria-hidden="true"
									className="size-5"
									strokeWidth={1.8}
								/>
							</div>
							<h3 className="mt-4 font-medium">Chưa có đơn hàng</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								Các đơn mới của khách hàng sẽ xuất hiện tại đây.
							</p>
						</div>
					)}
				</section>

				<aside className="border-border bg-card order-1 rounded-2xl border p-5 shadow-sm lg:sticky lg:top-6 lg:order-2">
					<div className="flex items-center gap-2">
						<UserRound
							aria-hidden="true"
							className="text-primary size-4.5"
							strokeWidth={1.8}
						/>
						<h2 className="font-semibold">Thông tin khách hàng</h2>
					</div>

					<div className="mt-5 space-y-5">
						<div className="flex items-start gap-3">
							<Phone
								aria-hidden="true"
								className="text-muted-foreground mt-0.5 size-4 shrink-0"
								strokeWidth={1.8}
							/>
							<div className="min-w-0">
								<p className="text-muted-foreground text-xs font-medium">
									Điện thoại
								</p>
								{customer.phone ? (
									<a
										href={`tel:${customer.phone}`}
										className="hover:text-primary mt-1 block text-sm font-medium transition-colors"
									>
										{formatPhone(customer.phone)}
									</a>
								) : (
									<p className="text-muted-foreground mt-1 text-sm">
										Chưa cập nhật
									</p>
								)}
							</div>
						</div>

						<div className="flex items-start gap-3">
							<MapPin
								aria-hidden="true"
								className="text-muted-foreground mt-0.5 size-4 shrink-0"
								strokeWidth={1.8}
							/>
							<div className="min-w-0">
								<p className="text-muted-foreground text-xs font-medium">Địa chỉ</p>
								<p className="mt-1 text-sm leading-6">
									{customer.address || "Chưa cập nhật"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<StickyNote
								aria-hidden="true"
								className="text-muted-foreground mt-0.5 size-4 shrink-0"
								strokeWidth={1.8}
							/>
							<div className="min-w-0">
								<p className="text-muted-foreground text-xs font-medium">Ghi chú</p>
								<p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
									{customer.note || "Chưa cập nhật"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<CalendarDays
								aria-hidden="true"
								className="text-muted-foreground mt-0.5 size-4 shrink-0"
								strokeWidth={1.8}
							/>
							<div>
								<p className="text-muted-foreground text-xs font-medium">
									Ngày tạo hồ sơ
								</p>
								<p className="mt-1 text-sm">
									{formatDateTime(customer.created_at)}
								</p>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
