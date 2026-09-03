"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { type OrderStatus } from "@/constants/order-status";

import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/constants/payment-status";

import { formatCurrency, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MarkOrderPaidButton } from "@/features/orders/components/mark-order-paid-button";

import type { OrderListItem } from "@/features/orders/type";
import Link from "next/dist/client/link";

type OrdersTableProps = {
	orders: OrderListItem[];
	onPaymentUpdated?: () => void;
};

function getPaymentStatusClassName(status: PaymentStatus) {
	switch (status) {
		case "unpaid":
			return "border-warning/30 bg-warning/10 text-warning";

		case "paid":
			return "border-success/30 bg-success/10 text-success";

		default:
			return "";
	}
}

export function OrdersTable({ orders, onPaymentUpdated }: OrdersTableProps) {
	return (
		<section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full min-w-200 text-sm">
					<thead>
						<tr className="border-border text-muted-foreground border-b text-left">
							<th className="px-5 py-3 font-medium">Mã đơn</th>

							<th className="px-5 py-3 font-medium">Khách hàng</th>

							<th className="px-5 py-3 font-medium">Số điện thoại</th>

							{/* <th className="px-5 py-3 font-medium">Trạng thái</th> */}

							<th className="px-5 py-3 font-medium">Thanh toán</th>

							<th className="px-5 py-3 font-medium">Tổng tiền</th>

							{/* <th className="px-5 py-3 font-medium">Hẹn lấy</th> */}

							<th className="px-5 py-3 font-medium">Ngày tạo</th>

							<th className="border-border bg-card sticky right-0 z-10 border-l px-5 py-3 text-right font-medium">
								Thao tác
							</th>
						</tr>
					</thead>

					<tbody>
						{orders.length > 0 ? (
							orders.map((order) => (
								<tr
									key={order.id}
									className="border-border group hover:bg-muted/50 border-b last:border-0"
								>
									<td className="px-5 py-4 font-semibold whitespace-nowrap">
										{order.order_code}
									</td>

									<td className="px-5 py-4">{order.customer_name}</td>

									<td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
										{order.customer_phone ?? "-"}
									</td>

									{/* <td className="px-5 py-4">
										<Badge
											variant="outline"
											className={cn(
												getOrderStatusClassName(order.status as OrderStatus)
											)}
										>
											{ORDER_STATUS_LABEL[order.status as OrderStatus] ??
												order.status}
										</Badge>
									</td> */}

									<td className="px-5 py-4">
										<Badge
											variant="outline"
											className={cn(
												getPaymentStatusClassName(order.payment_status)
											)}
										>
											{PAYMENT_STATUS_LABEL[order.payment_status]}
										</Badge>
									</td>

									<td className="px-5 py-4 font-medium whitespace-nowrap tabular-nums">
										{formatCurrency(Number(order.total_amount))}
									</td>

									{/* <td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
										{order.due_at ? formatTime(order.due_at) : "-"}
									</td> */}

									<td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
										{formatTime(order.created_at)}
									</td>

									<td className="border-border bg-card group-hover:bg-muted/50 sticky right-0 z-10 border-l px-5 py-4 text-right transition-colors">
										<div className="flex justify-end gap-2">
											{order.payment_status === "unpaid" ? (
												<MarkOrderPaidButton
													orderId={order.id}
													orderCode={order.order_code}
													customerName={order.customer_name}
													amount={Number(order.total_amount)}
													onSuccess={onPaymentUpdated}
												/>
											) : null}

											<Button asChild variant="ghost" size="sm">
												<Link href={`/orders/${order.id}`}>Xem</Link>
											</Button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={7}
									className="text-muted-foreground px-5 py-12 text-center"
								>
									Chưa có đơn hàng.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
