"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants/routes";

import { OrderSearchForm } from "@/features/orders/components/order-search-form";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { useOrders } from "@/features/orders/hooks/use-orders";

type OrdersListProps = {
	// From the URL: /orders?search=...
	search?: string;
};

export function OrdersList({ search }: OrdersListProps) {
	const [page, setPage] = useState(1);

	const { orders, pagination, isLoading, error, refetch } = useOrders({
		page,
		pageSize: 10,
		search
	});

	return (
		<div className="space-y-4">
			<div className="max-w-xl space-y-2">
				{/* key: a new search from the URL resets the text in the box. */}
				<OrderSearchForm key={search ?? ""} defaultValue={search} />

				{search ? (
					<p className="text-muted-foreground text-sm">
						Kết quả tìm “{search}” ·{" "}
						<Link href={PATHS.ORDERS} className="text-primary hover:underline">
							Xóa tìm kiếm
						</Link>
					</p>
				) : null}
			</div>

			{isLoading ? (
				<div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm">
					Đang tải danh sách đơn hàng...
				</div>
			) : error ? (
				<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
					{error}
				</div>
			) : (
				<>
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
				</>
			)}
		</div>
	);
}
