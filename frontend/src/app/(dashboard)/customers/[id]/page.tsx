import Link from "next/link";
import { notFound } from "next/navigation";
import {
	ArrowLeft,
	CalendarDays,
	ChevronDown,
	Clock3,
	PackageOpen,
	Phone,
	ReceiptText,
	WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL } from "@/constants/order-status";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment-method";
import { PAYMENT_STATUS_LABEL } from "@/constants/payment-status";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { getCustomerDetail } from "@/features/customers/services/get-customer-detail";
import { formatCurrency } from "@/lib/format";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
	hour: "2-digit",
	minute: "2-digit",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

const orderStatusLabels = ORDER_STATUS_LABEL as Record<string, string>;
const paymentStatusLabels = PAYMENT_STATUS_LABEL as Record<string, string>;
const paymentMethodLabels = PAYMENT_METHOD_LABEL as Record<string, string>;
const serviceUnitLabels = SERVICE_UNIT_LABEL as Record<string, string>;

type CustomerDetailPageProps = {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		page?: string | string[];
	}>;
};

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(-2)
		.map((part) => part.charAt(0).toLocaleUpperCase("vi-VN"))
		.join("");
}

function formatDate(value: string | null, fallback = "Chưa có đơn") {
	if (!value) return fallback;

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? "Không xác định" : dateFormatter.format(date);
}

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

function getOrderStatusClassName(status: string) {
	switch (status) {
		case "received":
			return "border-primary/30 bg-primary/10 text-primary";
		case "processing":
			return "border-warning/30 bg-warning/10 text-warning";
		case "completed":
		case "delivered":
			return "border-success/30 bg-success/10 text-success";
		case "cancelled":
			return "border-destructive/30 bg-destructive/10 text-destructive";
		default:
			return "";
	}
}

function getPaymentStatusClassName(status: string) {
	return status === "paid"
		? "border-success/30 bg-success/10 text-success"
		: "border-warning/30 bg-warning/10 text-warning";
}

function getPageNumber(value: string | string[] | undefined) {
	const rawValue = Array.isArray(value) ? value[0] : value;
	const page = Number(rawValue);

	return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function getPageHref(customerId: string, page: number) {
	return page <= 1 ? `/customers/${customerId}` : `/customers/${customerId}?page=${page}`;
}

export default async function CustomerDetailPage({
	params,
	searchParams
}: CustomerDetailPageProps) {
	const [routeParams, queryParams] = await Promise.all([params, searchParams]);
	const detail = await getCustomerDetail(routeParams.id, getPageNumber(queryParams.page));

	if (!detail) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Button asChild variant="ghost" size="sm" className="-ml-2">
				<Link href="/customers">
					<ArrowLeft aria-hidden="true" data-icon="inline-start" />
					Quay lại danh bạ
				</Link>
			</Button>

			<section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
				<div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold">
							{getInitials(detail.customer.name)}
						</div>
						<div className="min-w-0">
							<h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
								{detail.customer.name}
							</h2>
							<div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
								{detail.customer.phone ? (
									<a
										href={`tel:${detail.customer.phone}`}
										className="hover:text-primary inline-flex items-center gap-1.5 transition-colors"
									>
										<Phone
											aria-hidden="true"
											strokeWidth={1.8}
											className="size-4"
										/>
										{formatPhone(detail.customer.phone)}
									</a>
								) : (
									<span>Chưa có số điện thoại</span>
								)}
								<span className="inline-flex items-center gap-1.5">
									<CalendarDays
										aria-hidden="true"
										strokeWidth={1.8}
										className="size-4"
									/>
									Khách từ{" "}
									{formatDate(detail.customer.createdAt, "Không xác định")}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="border-border grid grid-cols-1 border-t sm:grid-cols-3">
					<div className="px-5 py-4 sm:px-6">
						<p className="font-mono text-2xl font-semibold tabular-nums">
							{detail.totalOrderCount}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">Tổng đơn hàng</p>
					</div>
					<div className="border-border border-t px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
						<p className="font-mono text-2xl font-semibold tabular-nums">
							{detail.unpaidOrderCount}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">Đơn chưa thanh toán</p>
					</div>
					<div className="border-border border-t px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
						<p className="text-base font-semibold">{formatDate(detail.lastOrderAt)}</p>
						<p className="text-muted-foreground mt-1 text-sm">Đơn gần nhất</p>
					</div>
				</div>
			</section>

			<section
				aria-labelledby="order-history-title"
				className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
			>
				<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2
							id="order-history-title"
							className="text-lg font-semibold tracking-tight"
						>
							Lịch sử đơn hàng
						</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							Mở từng đơn để xem dữ liệu đã ghi nhận tại thời điểm tiếp nhận.
						</p>
					</div>
					<Badge variant="secondary" className="h-7 px-2.5 font-mono tabular-nums">
						{detail.totalOrderCount} đơn
					</Badge>
				</header>

				<div className="border-primary/20 bg-primary/5 text-foreground flex items-start gap-3 border-b px-5 py-3 text-sm leading-6">
					<ReceiptText
						aria-hidden="true"
						strokeWidth={1.8}
						className="text-primary mt-0.5 size-4 shrink-0"
					/>
					<p>
						Thông tin dưới đây phản ánh dữ liệu hiện đang lưu trên từng đơn. Nhật ký
						thay đổi trạng thái chưa được ghi nhận riêng.
					</p>
				</div>

				{detail.orders.length > 0 ? (
					<div className="divide-border divide-y">
						{detail.orders.map((order) => (
							<details key={order.id} className="group">
								<summary className="hover:bg-muted/35 focus-visible:ring-ring grid cursor-pointer list-none gap-3 px-5 py-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset sm:grid-cols-[minmax(12rem,1.1fr)_minmax(12rem,0.9fr)_minmax(9rem,0.65fr)_auto] sm:items-center [&::-webkit-details-marker]:hidden">
									<div className="min-w-0">
										<p className="font-mono text-sm font-semibold tabular-nums">
											{order.orderCode}
										</p>
										<p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
											<Clock3
												aria-hidden="true"
												strokeWidth={1.8}
												className="size-3.5"
											/>
											{formatDateTime(order.createdAt)}
										</p>
									</div>

									<div className="flex flex-wrap gap-2">
										<Badge
											variant="outline"
											className={getOrderStatusClassName(order.status)}
										>
											{orderStatusLabels[order.status] ?? order.status}
										</Badge>
										<Badge
											variant="outline"
											className={getPaymentStatusClassName(
												order.paymentStatus
											)}
										>
											{paymentStatusLabels[order.paymentStatus] ??
												order.paymentStatus}
										</Badge>
									</div>

									<p className="font-mono text-sm font-semibold whitespace-nowrap tabular-nums sm:text-right">
										{formatCurrency(order.totalAmount)}
									</p>

									<ChevronDown
										aria-hidden="true"
										strokeWidth={1.8}
										className="text-muted-foreground size-4 transition-transform group-open:rotate-180"
									/>
								</summary>

								<div className="border-border bg-muted/15 grid gap-6 border-t px-5 py-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
									<div>
										<h3 className="flex items-center gap-2 text-sm font-semibold">
											<PackageOpen
												aria-hidden="true"
												strokeWidth={1.8}
												className="size-4"
											/>
											Dịch vụ trên đơn
										</h3>

										{order.items.length > 0 ? (
											<div className="border-border mt-3 overflow-x-auto rounded-xl border">
												<table className="w-full min-w-155 text-sm">
													<thead className="bg-muted/60 text-muted-foreground text-left text-xs">
														<tr>
															<th className="px-4 py-3 font-medium">
																Dịch vụ
															</th>
															<th className="px-4 py-3 font-medium">
																Số lượng
															</th>
															<th className="px-4 py-3 text-right font-medium">
																Đơn giá
															</th>
															<th className="px-4 py-3 text-right font-medium">
																Thành tiền
															</th>
														</tr>
													</thead>
													<tbody className="divide-border divide-y">
														{order.items.map((item, index) => (
															<tr
																key={`${order.id}-${item.serviceName}-${index}`}
															>
																<td className="px-4 py-3 font-medium">
																	{item.serviceName}
																</td>
																<td className="px-4 py-3">
																	{formatQuantity(item.quantity)}{" "}
																	{serviceUnitLabels[item.unit] ??
																		item.unit}
																</td>
																<td className="px-4 py-3 text-right font-mono tabular-nums">
																	{formatCurrency(item.unitPrice)}
																</td>
																<td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
																	{formatCurrency(item.lineTotal)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										) : (
											<p className="text-muted-foreground mt-3 text-sm">
												Đơn này chưa có chi tiết dịch vụ.
											</p>
										)}
									</div>

									<div className="space-y-5">
										<div>
											<h3 className="text-sm font-semibold">
												Thông tin ghi trên đơn
											</h3>
											<dl className="mt-3 grid gap-3 text-sm">
												<div>
													<dt className="text-muted-foreground text-xs">
														Khách hàng
													</dt>
													<dd className="mt-1 font-medium">
														{order.customerName}
													</dd>
												</div>
												<div>
													<dt className="text-muted-foreground text-xs">
														Số điện thoại
													</dt>
													<dd className="mt-1">
														{formatPhone(order.customerPhone)}
													</dd>
												</div>
												<div>
													<dt className="text-muted-foreground text-xs">
														Hẹn lấy
													</dt>
													<dd className="mt-1">
														{formatDateTime(
															order.dueAt,
															"Không có hẹn lấy"
														)}
													</dd>
												</div>
												<div>
													<dt className="text-muted-foreground text-xs">
														Ghi chú
													</dt>
													<dd className="mt-1 whitespace-pre-wrap">
														{order.note || "Không có ghi chú"}
													</dd>
												</div>
											</dl>
										</div>

										<div className="border-border border-t pt-5">
											<h3 className="flex items-center gap-2 text-sm font-semibold">
												<WalletCards
													aria-hidden="true"
													strokeWidth={1.8}
													className="size-4"
												/>
												Giao dịch thanh toán
											</h3>

											{order.payments.length > 0 ? (
												<ul className="mt-3 space-y-3">
													{order.payments.map((payment, index) => (
														<li
															key={`${order.id}-${payment.paidAt}-${index}`}
															className="text-sm"
														>
															<div className="flex items-center justify-between gap-3">
																<span>
																	{paymentMethodLabels[
																		payment.method
																	] ?? payment.method}
																</span>
																<strong className="font-mono tabular-nums">
																	{formatCurrency(payment.amount)}
																</strong>
															</div>
															<p className="text-muted-foreground mt-1 text-xs">
																{formatDateTime(payment.paidAt)}
															</p>
														</li>
													))}
												</ul>
											) : (
												<p className="text-muted-foreground mt-3 text-sm">
													Chưa có giao dịch thanh toán.
												</p>
											)}
										</div>
									</div>
								</div>
							</details>
						))}
					</div>
				) : (
					<div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
						<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
							<PackageOpen aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<h3 className="mt-4 text-base font-semibold">Khách hàng chưa có đơn</h3>
						<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
							Các đơn mới của khách hàng này sẽ xuất hiện tại đây để tra cứu.
						</p>
					</div>
				)}

				{detail.totalPages > 1 ? (
					<footer className="border-border flex items-center justify-between gap-3 border-t px-5 py-4">
						{detail.page > 1 ? (
							<Button asChild variant="outline" size="sm">
								<Link href={getPageHref(detail.customer.id, detail.page - 1)}>
									Trang trước
								</Link>
							</Button>
						) : (
							<Button type="button" variant="outline" size="sm" disabled>
								Trang trước
							</Button>
						)}
						<p className="text-muted-foreground font-mono text-xs tabular-nums">
							Trang {detail.page}/{detail.totalPages}
						</p>
						{detail.page < detail.totalPages ? (
							<Button asChild variant="outline" size="sm">
								<Link href={getPageHref(detail.customer.id, detail.page + 1)}>
									Trang sau
								</Link>
							</Button>
						) : (
							<Button type="button" variant="outline" size="sm" disabled>
								Trang sau
							</Button>
						)}
					</footer>
				) : null}
			</section>
		</div>
	);
}
