import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTime } from "@/lib/format";
import type { AttentionOrder } from "@/features/dashboard/types";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/constants/order-status";
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/constants/payment-status";

type AttentionOrdersTableProps = {
	orders: AttentionOrder[];
};

function getOrderStatusClassName(status: OrderStatus) {
	switch (status) {
		case "received":
			return "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300";
		case "processing":
			return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300";
		case "completed":
			return "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300";
		case "delivered":
			return "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";
		case "cancelled":
			return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300";
		default:
			return "";
	}
}

function getPaymentStatusClassName(status: PaymentStatus) {
	switch (status) {
		case "unpaid":
			return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
		case "paid":
			return "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300";
		default:
			return "";
	}
}

export function AttentionOrdersTable({ orders }: AttentionOrdersTableProps) {
	return (
		<section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
			<div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Orders Need Attention</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Orders that are unpaid, processing, completed, or close to due time.
					</p>
				</div>

				<Button asChild variant="outline" size="sm">
					<Link href="/orders">View all</Link>
				</Button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[900px] text-sm">
					<thead>
						<tr className="border-b border-border text-left text-muted-foreground">
							<th className="px-5 py-3 font-medium">Order Code</th>
							<th className="px-5 py-3 font-medium">Customer</th>
							<th className="px-5 py-3 font-medium">Service</th>
							<th className="px-5 py-3 font-medium">Status</th>
							<th className="px-5 py-3 font-medium">Payment</th>
							<th className="px-5 py-3 font-medium">Amount</th>
							<th className="px-5 py-3 font-medium">Due Time</th>
							<th className="px-5 py-3 text-right font-medium">Action</th>
						</tr>
					</thead>

					<tbody>
						{orders.length > 0 ? (
							orders.map((order) => (
								<tr
									key={order.id}
									className="border-b border-border last:border-0 hover:bg-muted/50"
								>
									<td className="px-5 py-4 font-medium">{order.orderCode}</td>

									<td className="px-5 py-4">{order.customerName}</td>

									<td className="px-5 py-4 text-muted-foreground">
										{order.serviceSummary}
									</td>

									<td className="px-5 py-4">
										<Badge
											variant="outline"
											className={cn(getOrderStatusClassName(order.status))}
										>
											{ORDER_STATUS_LABEL[order.status]}
										</Badge>
									</td>

									<td className="px-5 py-4">
										<Badge
											variant="outline"
											className={cn(
												getPaymentStatusClassName(order.paymentStatus)
											)}
										>
											{PAYMENT_STATUS_LABEL[order.paymentStatus]}
										</Badge>
									</td>

									<td className="px-5 py-4 font-medium">
										{formatCurrency(order.totalAmount)}
									</td>

									<td className="px-5 py-4 text-muted-foreground">
										{order.dueAt ? formatTime(order.dueAt) : "-"}
									</td>

									<td className="px-5 py-4 text-right">
										<Button asChild variant="ghost" size="sm">
											<Link href={`/orders/${order.id}`}>View</Link>
										</Button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={8}
									className="px-5 py-10 text-center text-muted-foreground"
								>
									No attention orders found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
