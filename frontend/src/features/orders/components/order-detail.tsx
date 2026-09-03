"use client";

import Link from "next/link";
import {
	ArrowLeft,
	CalendarDays,
	CircleAlert,
	Clock3,
	MapPin,
	PackageOpen,
	Phone,
	ReceiptText,
	RotateCcw,
	UserRound,
	WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/constants/order-status";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment-method";
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/constants/payment-status";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { useOrder } from "@/features/orders/hooks/use-order";
import type { OrderItemDetail, OrderPayment } from "@/features/orders/type";
import { formatCurrency } from "@/lib/format";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
	hour: "2-digit",
	minute: "2-digit",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

const paymentMethodLabels = PAYMENT_METHOD_LABEL as Record<string, string>;
const serviceUnitLabels = SERVICE_UNIT_LABEL as Record<string, string>;

type OrderDetailProps = {
	orderId: string;
};

function formatDateTime(value: string | null, fallback = "Chưa ghi nhận") {
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

function formatQuantity(value: number) {
	return new Intl.NumberFormat("vi-VN", {
		maximumFractionDigits: 2
	}).format(value);
}

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(-2)
		.map((part) => part.charAt(0).toLocaleUpperCase("vi-VN"))
		.join("");
}

function getOrderStatusClassName(status: OrderStatus) {
	switch (status) {
		case "received":
			return "border-primary/30 bg-primary/10 text-primary";
		case "processing":
			return "border-warning/30 bg-warning/10 text-warning";
		case "completed":
			return "border-success/30 bg-success/10 text-success";
		case "delivered":
			return "border-border bg-secondary text-secondary-foreground";
		case "cancelled":
			return "border-destructive/30 bg-destructive/10 text-destructive";
	}
}

function getPaymentStatusClassName(status: PaymentStatus) {
	return status === "paid"
		? "border-success/30 bg-success/10 text-success"
		: "border-warning/30 bg-warning/10 text-warning";
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
	return (
		<Badge variant="outline" className={getOrderStatusClassName(status)}>
			{ORDER_STATUS_LABEL[status]}
		</Badge>
	);
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
	return (
		<Badge variant="outline" className={getPaymentStatusClassName(status)}>
			{PAYMENT_STATUS_LABEL[status]}
		</Badge>
	);
}

function BackToOrdersButton() {
	return (
		<Button asChild variant="ghost" size="sm" className="-ml-2">
			<Link href="/orders">
				<ArrowLeft aria-hidden="true" data-icon="inline-start" />
				Quay lại danh sách
			</Link>
		</Button>
	);
}

function OrderDetailSkeleton() {
	return (
		<div role="status" aria-live="polite" className="space-y-6">
			<span className="sr-only">Đang tải thông tin đơn hàng...</span>
			<div aria-hidden="true" className="bg-muted h-8 w-36 rounded-md" />

			<div
				aria-hidden="true"
				className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
			>
				<div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
					<div className="flex items-center gap-4">
						<div className="bg-muted size-12 rounded-xl" />
						<div className="space-y-2">
							<div className="bg-muted h-6 w-40 rounded-md" />
							<div className="bg-muted h-5 w-52 rounded-md" />
						</div>
					</div>
					<div className="space-y-2 sm:text-right">
						<div className="bg-muted h-4 w-20 rounded-md sm:ml-auto" />
						<div className="bg-muted h-7 w-40 rounded-md" />
					</div>
				</div>

				<div className="border-border grid border-t sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="border-border space-y-2 border-b px-5 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
						>
							<div className="bg-muted h-4 w-20 rounded-md" />
							<div className="bg-muted h-5 w-32 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<div
				aria-hidden="true"
				className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]"
			>
				<div className="border-border bg-card min-h-80 rounded-2xl border shadow-sm" />
				<div className="space-y-6">
					<div className="border-border bg-card h-52 rounded-2xl border shadow-sm" />
					<div className="border-border bg-card h-32 rounded-2xl border shadow-sm" />
				</div>
			</div>
		</div>
	);
}

function OrderItemMobileCard({ item }: { item: OrderItemDetail }) {
	return (
		<article className="border-border rounded-xl border p-4">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<h3 className="font-medium">{item.service_name}</h3>
					{item.note ? (
						<p className="text-muted-foreground mt-1 text-xs leading-5">{item.note}</p>
					) : null}
				</div>
				<p className="font-mono text-sm font-semibold whitespace-nowrap tabular-nums">
					{formatCurrency(Number(item.line_total))}
				</p>
			</div>

			<dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div>
					<dt className="text-muted-foreground text-xs">Số lượng</dt>
					<dd className="mt-1">
						{formatQuantity(Number(item.quantity))}{" "}
						{serviceUnitLabels[item.unit] ?? item.unit}
					</dd>
				</div>
				<div className="text-right">
					<dt className="text-muted-foreground text-xs">Đơn giá</dt>
					<dd className="mt-1 font-mono tabular-nums">
						{formatCurrency(Number(item.unit_price))}
					</dd>
				</div>
			</dl>
		</article>
	);
}

function PaymentRow({ payment }: { payment: OrderPayment }) {
	return (
		<div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
					<WalletCards aria-hidden="true" strokeWidth={1.8} className="size-4" />
				</div>
				<div>
					<p className="text-sm font-medium">
						{paymentMethodLabels[payment.method] ?? payment.method}
					</p>
					<p className="text-muted-foreground mt-1 text-xs tabular-nums">
						{formatDateTime(payment.paid_at)}
					</p>
				</div>
			</div>
			<p className="font-mono text-sm font-semibold tabular-nums sm:text-right">
				{formatCurrency(Number(payment.amount))}
			</p>
		</div>
	);
}

export function OrderDetail({ orderId }: OrderDetailProps) {
	const { data, isLoading, error, refetch } = useOrder(orderId);

	if (isLoading) {
		return <OrderDetailSkeleton />;
	}

	if (error || !data) {
		return (
			<div className="space-y-6">
				<BackToOrdersButton />
				<section
					role="alert"
					className="border-destructive/30 bg-destructive/5 flex min-h-72 flex-col items-center justify-center rounded-2xl border px-5 py-12 text-center shadow-sm"
				>
					<div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-xl">
						<CircleAlert aria-hidden="true" strokeWidth={1.8} className="size-5" />
					</div>
					<h2 className="mt-4 text-lg font-semibold">Không thể hiển thị đơn hàng</h2>
					<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
						{error || "Không tìm thấy đơn hàng này."}
					</p>
					<Button
						type="button"
						variant="outline"
						className="mt-5"
						onClick={() => void refetch()}
					>
						<RotateCcw aria-hidden="true" data-icon="inline-start" />
						Thử tải lại
					</Button>
				</section>
			</div>
		);
	}

	const { order, items, payments, customer } = data;

	return (
		<div className="space-y-6">
			<BackToOrdersButton />

			<section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
				<div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-start gap-4">
						<div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
							<ReceiptText aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground text-sm">Mã đơn hàng</p>
							<h2 className="mt-1 truncate font-mono text-xl font-semibold tracking-tight sm:text-2xl">
								{order.order_code}
							</h2>
							<div className="mt-3 flex flex-wrap gap-2">
								<OrderStatusBadge status={order.status} />
								<PaymentStatusBadge status={order.payment_status} />
							</div>
						</div>
					</div>

					<div className="lg:text-right">
						<p className="text-muted-foreground text-sm">Tổng tiền</p>
						<p className="mt-1 font-mono text-2xl font-semibold tracking-tight tabular-nums">
							{formatCurrency(Number(order.total_amount))}
						</p>
					</div>
				</div>

				<div className="border-border grid border-t sm:grid-cols-3">
					<div className="px-5 py-4 sm:px-6">
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<CalendarDays
								aria-hidden="true"
								strokeWidth={1.8}
								className="size-3.5"
							/>
							Ngày tạo
						</p>
						<p className="mt-1.5 text-sm font-medium tabular-nums">
							{formatDateTime(order.created_at)}
						</p>
					</div>
					<div className="border-border border-t px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<Clock3 aria-hidden="true" strokeWidth={1.8} className="size-3.5" />
							Hẹn lấy
						</p>
						<p className="mt-1.5 text-sm font-medium tabular-nums">
							{formatDateTime(order.due_at, "Chưa có hẹn lấy")}
						</p>
					</div>
					<div className="border-border border-t px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<WalletCards
								aria-hidden="true"
								strokeWidth={1.8}
								className="size-3.5"
							/>
							Giao dịch
						</p>
						<p className="mt-1.5 text-sm font-medium tabular-nums">
							{payments.length} giao dịch thanh toán
						</p>
					</div>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)] xl:items-start">
				<section
					aria-labelledby="order-items-title"
					className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
				>
					<header className="border-border flex items-center justify-between gap-4 border-b px-5 py-4">
						<div>
							<h2 id="order-items-title" className="font-semibold">
								Dịch vụ trong đơn
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Số lượng, đơn giá và thành tiền đã ghi nhận.
							</p>
						</div>
						<Badge variant="secondary" className="h-7 px-2.5 font-mono tabular-nums">
							{items.length} mục
						</Badge>
					</header>

					{items.length > 0 ? (
						<>
							<div className="hidden overflow-x-auto md:block">
								<table className="w-full min-w-170 text-sm">
									<thead>
										<tr className="border-border bg-muted/40 text-muted-foreground border-b text-left text-xs">
											<th className="px-5 py-3 font-medium">Dịch vụ</th>
											<th className="px-5 py-3 font-medium">Số lượng</th>
											<th className="px-5 py-3 text-right font-medium">
												Đơn giá
											</th>
											<th className="px-5 py-3 text-right font-medium">
												Thành tiền
											</th>
										</tr>
									</thead>
									<tbody className="divide-border divide-y">
										{items.map((item) => (
											<tr key={item.id}>
												<td className="px-5 py-4">
													<p className="font-medium">
														{item.service_name}
													</p>
													{item.note ? (
														<p className="text-muted-foreground mt-1 max-w-72 text-xs leading-5">
															{item.note}
														</p>
													) : null}
												</td>
												<td className="px-5 py-4 whitespace-nowrap tabular-nums">
													{formatQuantity(Number(item.quantity))}{" "}
													{serviceUnitLabels[item.unit] ?? item.unit}
												</td>
												<td className="px-5 py-4 text-right font-mono whitespace-nowrap tabular-nums">
													{formatCurrency(Number(item.unit_price))}
												</td>
												<td className="px-5 py-4 text-right font-mono font-semibold whitespace-nowrap tabular-nums">
													{formatCurrency(Number(item.line_total))}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="grid gap-3 p-4 md:hidden">
								{items.map((item) => (
									<OrderItemMobileCard key={item.id} item={item} />
								))}
							</div>
						</>
					) : (
						<div className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center">
							<div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
								<PackageOpen
									aria-hidden="true"
									strokeWidth={1.8}
									className="size-5"
								/>
							</div>
							<h3 className="mt-4 text-sm font-semibold">Chưa có dịch vụ</h3>
							<p className="text-muted-foreground mt-1.5 text-sm">
								Đơn hàng này chưa có chi tiết dịch vụ.
							</p>
						</div>
					)}

					<div className="border-border bg-muted/20 flex items-center justify-between gap-4 border-t px-5 py-4">
						<p className="text-sm font-medium">Tổng cộng</p>
						<p className="font-mono text-lg font-semibold whitespace-nowrap tabular-nums">
							{formatCurrency(Number(order.total_amount))}
						</p>
					</div>
				</section>

				<aside className="space-y-6">
					<section
						aria-labelledby="order-customer-title"
						className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
					>
						<header className="border-border border-b px-5 py-4">
							<h2 id="order-customer-title" className="font-semibold">
								Khách hàng
							</h2>
						</header>
						<div className="p-5">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
									{getInitials(order.customer_name) || (
										<UserRound aria-hidden="true" className="size-4" />
									)}
								</div>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold">
										{order.customer_name}
									</p>
									{order.customer_phone ? (
										<a
											href={`tel:${order.customer_phone}`}
											className="text-muted-foreground hover:text-primary mt-1 inline-flex items-center gap-1.5 text-sm transition-colors"
										>
											<Phone
												aria-hidden="true"
												strokeWidth={1.8}
												className="size-3.5"
											/>
											{formatPhone(order.customer_phone)}
										</a>
									) : (
										<p className="text-muted-foreground mt-1 text-sm">
											Chưa có số điện thoại
										</p>
									)}
								</div>
							</div>

							{customer?.address ? (
								<div className="border-border mt-5 border-t pt-4">
									<p className="text-muted-foreground flex items-start gap-2 text-sm leading-6">
										<MapPin
											aria-hidden="true"
											strokeWidth={1.8}
											className="mt-1 size-3.5 shrink-0"
										/>
										<span>{customer.address}</span>
									</p>
								</div>
							) : null}
						</div>
					</section>

					<section
						aria-labelledby="order-note-title"
						className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
					>
						<header className="border-border border-b px-5 py-4">
							<h2 id="order-note-title" className="font-semibold">
								Ghi chú đơn hàng
							</h2>
						</header>
						<p className="text-muted-foreground px-5 py-4 text-sm leading-6 whitespace-pre-wrap">
							{order.note || "Không có ghi chú cho đơn hàng này."}
						</p>
					</section>
				</aside>
			</div>

			<section
				aria-labelledby="order-payments-title"
				className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
			>
				<header className="border-border flex items-center justify-between gap-4 border-b px-5 py-4">
					<div>
						<h2 id="order-payments-title" className="font-semibold">
							Lịch sử thanh toán
						</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							Các giao dịch đã được ghi nhận cho đơn hàng.
						</p>
					</div>
					<PaymentStatusBadge status={order.payment_status} />
				</header>

				{payments.length > 0 ? (
					<div className="divide-border divide-y">
						{payments.map((payment) => (
							<PaymentRow key={payment.id} payment={payment} />
						))}
					</div>
				) : (
					<div className="flex min-h-44 flex-col items-center justify-center px-5 py-10 text-center">
						<div className="bg-warning/10 text-warning flex size-11 items-center justify-center rounded-xl">
							<WalletCards aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<h3 className="mt-4 text-sm font-semibold">Chưa có giao dịch thanh toán</h3>
						<p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
							Giao dịch mới sẽ xuất hiện tại đây sau khi được ghi nhận.
						</p>
					</div>
				)}
			</section>
		</div>
	);
}
