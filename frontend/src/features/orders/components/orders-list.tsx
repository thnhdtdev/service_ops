"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { OrdersTable } from "@/features/orders/components/orders-table";
import { useOrders } from "@/features/orders/hooks/use-orders";

export function OrdersList() {
	const [page, setPage] = useState(1);

	const { orders, pagination, isLoading, error, refetch } = useOrders({
		page,
		pageSize: 10
	});

	if (isLoading) {
		return (
			<div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm">
				Đang tải danh sách đơn hàng...
			</div>
		);
	}

	if (error) {
		return (
			<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<OrdersTable orders={orders} onPaymentUpdated={refetch} />

			{pagination ? (
				<div className="flex items-center justify-between gap-4">
					<p className="text-muted-foreground text-sm">
						Tổng {pagination.total} đơn hàng
					</p>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((current) => current - 1)}
						>
							Trước
						</Button>

						<span className="text-muted-foreground text-sm">
							Trang {pagination.page} / {Math.max(pagination.total_pages, 1)}
						</span>

						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={page >= pagination.total_pages}
							onClick={() => setPage((current) => current + 1)}
						>
							Sau
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
