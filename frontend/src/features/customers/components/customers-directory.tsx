"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCustomers } from "@/features/customers/hooks/use-customers";

import {
	formatCurrency,
	formatTime
} from "@/lib/format";

export function CustomersDirectory() {
	const [page, setPage] = useState(1);

	const [searchInput, setSearchInput] =
		useState("");

	const [search, setSearch] =
		useState("");

	// Debounce search để không request mỗi lần gõ 1 ký tự
	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [searchInput]);

	const {
		customers,
		stats,
		pagination,
		isLoading,
		error
	} = useCustomers({
		page,
		pageSize: 20,
		search: search || undefined
	});

	return (
		<div className="space-y-6">
			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-2">
				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<p className="text-muted-foreground text-sm">
						Tổng khách hàng
					</p>

					<p className="mt-2 text-2xl font-bold tabular-nums">
						{stats?.total_customer_count ?? 0}
					</p>

					<p className="text-muted-foreground mt-1 text-sm">
						Tổng số khách hàng trong hệ thống
					</p>
				</section>

				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm">
					<p className="text-muted-foreground text-sm">
						Khách mới tháng này
					</p>

					<p className="mt-2 text-2xl font-bold tabular-nums">
						{stats?.new_customer_count_this_month ?? 0}
					</p>

					<p className="text-muted-foreground mt-1 text-sm">
						Khách hàng được tạo trong tháng
					</p>
				</section>
			</div>

			{/* Header + Search */}
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
				<div>
					<h2 className="text-xl font-bold tracking-tight">
						Khách hàng
					</h2>

					<p className="text-muted-foreground mt-1 text-sm">
						Quản lý khách hàng và lịch sử sử dụng dịch vụ.
					</p>
				</div>

				<div className="relative w-full md:w-80">
					<Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />

					<Input
						value={searchInput}
						onChange={(event) =>
							setSearchInput(event.target.value)
						}
						placeholder="Tìm theo tên hoặc số điện thoại"
						className="pl-9"
					/>
				</div>
			</div>

			{/* Error */}
			{error ? (
				<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
					{error}
				</div>
			) : null}

			{/* Table */}
			<section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full min-w-225 text-sm">
						<thead>
							<tr className="border-border text-muted-foreground border-b text-left">
								<th className="px-5 py-3 font-medium">
									Khách hàng
								</th>

								<th className="px-5 py-3 font-medium">
									Số điện thoại
								</th>

								<th className="px-5 py-3 font-medium">
									Số đơn
								</th>

								<th className="px-5 py-3 font-medium">
									Chưa thanh toán
								</th>

								<th className="px-5 py-3 font-medium">
									Đơn gần nhất
								</th>

								<th className="px-5 py-3 font-medium">
									Tổng giá trị
								</th>

								<th className="px-5 py-3 text-right font-medium">
									Thao tác
								</th>
							</tr>
						</thead>

						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={7}
										className="text-muted-foreground px-5 py-12 text-center"
									>
										Đang tải danh sách khách hàng...
									</td>
								</tr>
							) : customers.length > 0 ? (
								customers.map((customer) => (
									<tr
										key={customer.id}
										className="border-border hover:bg-muted/50 border-b last:border-0"
									>
										<td className="px-5 py-4 font-medium">
											{customer.name}
										</td>

										<td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
											{customer.phone ?? "-"}
										</td>

										<td className="px-5 py-4 tabular-nums">
											{customer.order_count}
										</td>

										<td className="px-5 py-4 tabular-nums">
											{customer.unpaid_order_count}
										</td>

										<td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
											{customer.last_order_at
												? formatTime(customer.last_order_at)
												: "-"}
										</td>

										<td className="px-5 py-4 font-medium whitespace-nowrap tabular-nums">
											{formatCurrency(
												Number(customer.total_order_value)
											)}
										</td>

										<td className="px-5 py-4 text-right">
											<Button
												asChild
												variant="ghost"
												size="sm"
											>
												<Link
													href={`/customers/${customer.id}`}
												>
													Xem
												</Link>
											</Button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="text-muted-foreground px-5 py-12 text-center"
									>
										{search
											? "Không tìm thấy khách hàng phù hợp."
											: "Chưa có khách hàng."}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>

			{/* Pagination */}
			{pagination ? (
				<div className="flex flex-wrap items-center justify-between gap-4">
					<p className="text-muted-foreground text-sm">
						Tổng {pagination.total} khách hàng
					</p>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={
								isLoading ||
								page <= 1
							}
							onClick={() =>
								setPage((current) =>
									Math.max(1, current - 1)
								)
							}
						>
							Trước
						</Button>

						<span className="text-muted-foreground text-sm">
							Trang {pagination.page} /{" "}
							{Math.max(
								pagination.total_pages,
								1
							)}
						</span>

						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={
								isLoading ||
								page >= pagination.total_pages
							}
							onClick={() =>
								setPage((current) =>
									current + 1
								)
							}
						>
							Sau
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}