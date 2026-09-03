"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	CircleAlert,
	Phone,
	RotateCcw,
	Search,
	UserPlus,
	UsersRound,
	X
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import type { CustomerListItem } from "@/features/customers/types";
import { formatCurrency } from "@/lib/format";

const CUSTOMER_SKELETON_COUNT = 6;

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

function formatDate(value: string | null) {
	if (!value) return "Chưa có đơn";

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? "Không xác định" : dateFormatter.format(date);
}

function formatPhone(phone: string | null) {
	if (!phone) return "Chưa cập nhật";

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

function CustomerAvatar({ name }: { name: string }) {
	return (
		<span
			aria-hidden="true"
			className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
		>
			{getInitials(name)}
		</span>
	);
}

function UnpaidCount({ count }: { count: number }) {
	if (count === 0) {
		return <span className="text-muted-foreground font-mono tabular-nums">0</span>;
	}

	return (
		<Badge
			variant="outline"
			className="border-warning/30 bg-warning/10 text-warning font-mono tabular-nums"
		>
			{count} đơn
		</Badge>
	);
}

function InitialDirectorySkeleton() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="animate-pulse space-y-6 motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải danh sách khách hàng...</span>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.75fr)]">
				<div className="border-border bg-card rounded-2xl border p-5 sm:p-6">
					<div className="bg-muted h-7 w-44 rounded-md" />
					<div className="bg-muted mt-3 h-4 w-80 max-w-full rounded-md" />
					<div className="bg-muted mt-5 h-10 w-full rounded-md" />
				</div>

				<div className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-2xl border">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className="border-border border-l p-5 first:border-l-0 sm:p-6"
						>
							<div className="bg-muted size-5 rounded-md" />
							<div className="bg-muted mt-7 h-8 w-16 rounded-md" />
							<div className="bg-muted mt-2 h-3 w-24 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<DirectoryListSkeleton />
		</div>
	);
}

function DirectoryListSkeleton() {
	return (
		<section
			aria-hidden="true"
			className="border-border bg-card overflow-hidden rounded-2xl border"
		>
			<div className="border-border border-b px-5 py-4">
				<div className="bg-muted h-5 w-44 rounded-md" />
				<div className="bg-muted mt-2 h-3 w-72 max-w-full rounded-md" />
			</div>

			<DirectoryRowsSkeleton />
		</section>
	);
}

function DirectoryRowsSkeleton() {
	return (
		<>
			<div className="hidden animate-pulse motion-reduce:animate-none xl:block">
				{Array.from({ length: CUSTOMER_SKELETON_COUNT }).map((_, index) => (
					<div
						key={index}
						className="border-border grid grid-cols-[minmax(15rem,2fr)_0.6fr_1fr_1fr_1.1fr_4rem] items-center gap-4 border-b px-5 py-4 last:border-b-0"
					>
						<div className="flex items-center gap-3">
							<div className="bg-muted size-10 shrink-0 rounded-xl" />
							<div className="space-y-2">
								<div className="bg-muted h-4 w-32 rounded-md" />
								<div className="bg-muted h-3 w-24 rounded-md" />
							</div>
						</div>
						<div className="bg-muted h-4 w-10 rounded-md" />
						<div className="bg-muted h-5 w-16 rounded-4xl" />
						<div className="bg-muted h-4 w-24 rounded-md" />
						<div className="bg-muted h-4 w-28 rounded-md" />
						<div className="bg-muted ml-auto size-8 rounded-md" />
					</div>
				))}
			</div>

			<div className="divide-border animate-pulse divide-y motion-reduce:animate-none xl:hidden">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="space-y-4 p-5">
						<div className="flex items-center gap-3">
							<div className="bg-muted size-10 shrink-0 rounded-xl" />
							<div className="flex-1 space-y-2">
								<div className="bg-muted h-4 w-36 rounded-md" />
								<div className="bg-muted h-3 w-28 rounded-md" />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-muted h-10 rounded-md" />
							<div className="bg-muted h-10 rounded-md" />
							<div className="bg-muted h-10 rounded-md" />
							<div className="bg-muted h-10 rounded-md" />
						</div>
						<div className="border-border flex justify-end border-t pt-3">
							<div className="bg-muted h-8 w-24 rounded-md" />
						</div>
					</div>
				))}
			</div>
		</>
	);
}

function DesktopCustomerTable({ customers }: { customers: CustomerListItem[] }) {
	return (
		<div className="hidden xl:block">
			<table className="w-full table-fixed text-sm">
				<caption className="sr-only">
					Danh sách khách hàng, số đơn và tổng giá trị sử dụng dịch vụ
				</caption>
				<thead>
					<tr className="border-border text-muted-foreground border-b text-left">
						<th scope="col" className="w-[31%] px-5 py-3 font-medium">
							Khách hàng
						</th>
						<th scope="col" className="w-[10%] px-4 py-3 text-center font-medium">
							Số đơn
						</th>
						<th scope="col" className="w-[16%] px-4 py-3 font-medium">
							Chưa thanh toán
						</th>
						<th scope="col" className="w-[15%] px-4 py-3 font-medium">
							Đơn gần nhất
						</th>
						<th scope="col" className="w-[18%] px-4 py-3 text-right font-medium">
							Tổng giá trị
						</th>
						<th scope="col" className="w-[10%] px-5 py-3 text-right font-medium">
							Thao tác
						</th>
					</tr>
				</thead>
				<tbody>
					{customers.map((customer) => (
						<tr
							key={customer.id}
							className="border-border hover:bg-muted/40 border-b transition-colors last:border-b-0"
						>
							<td className="px-5 py-4">
								<div className="flex min-w-0 items-center gap-3">
									<CustomerAvatar name={customer.name} />
									<div className="min-w-0">
										<p className="truncate font-semibold">{customer.name}</p>
										{customer.phone ? (
											<a
												href={`tel:${customer.phone}`}
												className="text-muted-foreground hover:text-primary mt-0.5 block truncate text-xs transition-colors"
											>
												{formatPhone(customer.phone)}
											</a>
										) : (
											<p className="text-muted-foreground mt-0.5 truncate text-xs">
												Chưa có số điện thoại
											</p>
										)}
									</div>
								</div>
							</td>
							<td className="px-4 py-4 text-center font-mono tabular-nums">
								{customer.order_count}
							</td>
							<td className="px-4 py-4">
								<UnpaidCount count={customer.unpaid_order_count} />
							</td>
							<td className="text-muted-foreground px-4 py-4 whitespace-nowrap">
								{formatDate(customer.last_order_at)}
							</td>
							<td className="px-4 py-4 text-right font-mono font-semibold whitespace-nowrap tabular-nums">
								{formatCurrency(Number(customer.total_order_value))}
							</td>
							<td className="px-5 py-4 text-right">
								<Button asChild variant="ghost" size="sm">
									<Link href={`/customers/${customer.id}`}>
										Xem
										<ArrowRight aria-hidden="true" data-icon="inline-end" />
									</Link>
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function MobileCustomerList({ customers }: { customers: CustomerListItem[] }) {
	return (
		<div className="divide-border divide-y xl:hidden">
			{customers.map((customer) => (
				<article key={customer.id} className="p-5">
					<div className="flex items-start gap-3">
						<CustomerAvatar name={customer.name} />
						<div className="min-w-0 flex-1">
							<h3 className="truncate font-semibold">{customer.name}</h3>
							{customer.phone ? (
								<a
									href={`tel:${customer.phone}`}
									className="text-muted-foreground hover:text-primary mt-1 inline-flex items-center gap-1.5 text-sm transition-colors"
								>
									<Phone
										aria-hidden="true"
										className="size-3.5"
										strokeWidth={1.8}
									/>
									{formatPhone(customer.phone)}
								</a>
							) : (
								<p className="text-muted-foreground mt-1 text-sm">
									Chưa có số điện thoại
								</p>
							)}
						</div>
					</div>

					<dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
						<div>
							<dt className="text-muted-foreground text-xs font-medium">Tổng đơn</dt>
							<dd className="mt-1 font-mono font-semibold tabular-nums">
								{customer.order_count}
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground text-xs font-medium">
								Chưa thanh toán
							</dt>
							<dd className="mt-1">
								<UnpaidCount count={customer.unpaid_order_count} />
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground text-xs font-medium">
								Đơn gần nhất
							</dt>
							<dd className="mt-1 text-sm">{formatDate(customer.last_order_at)}</dd>
						</div>
						<div>
							<dt className="text-muted-foreground text-xs font-medium">
								Tổng giá trị
							</dt>
							<dd className="mt-1 font-mono font-semibold tracking-tight tabular-nums">
								{formatCurrency(Number(customer.total_order_value))}
							</dd>
						</div>
					</dl>

					<div className="border-border mt-4 flex justify-end border-t pt-3">
						<Button asChild variant="ghost" size="sm" className="-mr-2">
							<Link href={`/customers/${customer.id}`}>
								Xem hồ sơ
								<ArrowRight aria-hidden="true" data-icon="inline-end" />
							</Link>
						</Button>
					</div>
				</article>
			))}
		</div>
	);
}

export function CustomersDirectory() {
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [searchInput]);

	const { customers, stats, pagination, isLoading, error, refetch } = useCustomers({
		page,
		pageSize: 20,
		search: search || undefined
	});

	const isInitialLoading = isLoading && !stats && !pagination;
	const visibleRangeStart = pagination ? (pagination.page - 1) * pagination.page_size + 1 : 0;
	const visibleRangeEnd = pagination
		? Math.min(pagination.page * pagination.page_size, pagination.total)
		: 0;

	function clearSearch() {
		setSearchInput("");
		setSearch("");
		setPage(1);
	}

	if (isInitialLoading) return <InitialDirectorySkeleton />;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.75fr)]">
				<section className="border-border bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
					<h1 className="text-2xl font-bold tracking-tight">Khách hàng</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Tìm kiếm khách hàng và theo dõi lịch sử sử dụng dịch vụ.
					</p>

					<div className="relative mt-5">
						<label htmlFor="customer-search" className="sr-only">
							Tìm khách hàng theo tên hoặc số điện thoại
						</label>
						<Search
							aria-hidden="true"
							className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							strokeWidth={1.8}
						/>
						<Input
							id="customer-search"
							type="text"
							inputMode="search"
							autoComplete="off"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Tìm theo tên hoặc số điện thoại"
							className="h-10 pr-10 pl-9"
						/>
						{searchInput ? (
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								className="absolute top-1/2 right-1.5 -translate-y-1/2"
								onClick={clearSearch}
								aria-label="Xóa tìm kiếm"
							>
								<X aria-hidden="true" />
							</Button>
						) : null}
					</div>
				</section>

				<dl className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-2xl border shadow-sm">
					<div className="border-border flex flex-col border-r p-5 sm:p-6">
						<UsersRound
							aria-hidden="true"
							className="text-primary size-5"
							strokeWidth={1.8}
						/>
						<dt className="text-muted-foreground order-3 mt-1 text-xs font-medium">
							Tổng khách hàng
						</dt>
						<dd className="order-2 mt-7 font-mono text-2xl font-semibold tabular-nums">
							{stats ? stats.total_customer_count : "-"}
						</dd>
					</div>
					<div className="flex flex-col p-5 sm:p-6">
						<UserPlus
							aria-hidden="true"
							className="text-success size-5"
							strokeWidth={1.8}
						/>
						<dt className="text-muted-foreground order-3 mt-1 text-xs font-medium">
							Khách mới tháng này
						</dt>
						<dd className="order-2 mt-7 font-mono text-2xl font-semibold tabular-nums">
							{stats ? stats.new_customer_count_this_month : "-"}
						</dd>
					</div>
				</dl>
			</div>

			{error ? (
				<section
					role="alert"
					className="border-destructive/25 bg-card rounded-2xl border p-6 sm:p-8"
				>
					<div className="flex max-w-xl items-start gap-4">
						<div className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
							<CircleAlert aria-hidden="true" className="size-5" strokeWidth={1.8} />
						</div>
						<div>
							<h2 className="font-semibold">Không thể tải danh sách khách hàng</h2>
							<p className="text-muted-foreground mt-1 text-sm leading-6">{error}</p>
							<Button type="button" className="mt-5" onClick={refetch}>
								<RotateCcw aria-hidden="true" data-icon="inline-start" />
								Thử lại
							</Button>
						</div>
					</div>
				</section>
			) : (
				<section
					aria-labelledby="customer-list-heading"
					aria-busy={isLoading}
					className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
				>
					<header className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
						<div>
							<h2 id="customer-list-heading" className="font-semibold">
								Danh sách khách hàng
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								{search
									? `Kết quả tìm kiếm cho “${search}”.`
									: "Thông tin và lịch sử sử dụng dịch vụ của khách hàng."}
							</p>
						</div>
						{pagination ? (
							<p className="text-muted-foreground text-sm tabular-nums">
								{pagination.total} khách hàng
							</p>
						) : null}
					</header>

					{isLoading ? (
						<>
							<span className="sr-only" aria-live="polite">
								Đang tải danh sách khách hàng...
							</span>
							<DirectoryRowsSkeleton />
						</>
					) : customers.length > 0 ? (
						<>
							<DesktopCustomerTable customers={customers} />
							<MobileCustomerList customers={customers} />
						</>
					) : (
						<div className="px-5 py-14 text-center">
							<div className="bg-muted text-muted-foreground mx-auto flex size-11 items-center justify-center rounded-xl">
								<UsersRound
									aria-hidden="true"
									className="size-5"
									strokeWidth={1.8}
								/>
							</div>
							<h3 className="mt-4 font-medium">
								{search ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
							</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								{search
									? "Thử tên, số điện thoại khác hoặc xóa tìm kiếm hiện tại."
									: "Khách hàng mới sẽ xuất hiện tại đây."}
							</p>
							{search ? (
								<Button
									type="button"
									variant="outline"
									className="mt-5"
									onClick={clearSearch}
								>
									<X aria-hidden="true" data-icon="inline-start" />
									Xóa tìm kiếm
								</Button>
							) : null}
						</div>
					)}
				</section>
			)}

			{!error && pagination && pagination.total > 0 ? (
				<nav
					aria-label="Phân trang danh sách khách hàng"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-muted-foreground text-sm tabular-nums">
						Hiển thị {visibleRangeStart}-{visibleRangeEnd} trong {pagination.total}{" "}
						khách hàng
					</p>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isLoading || page <= 1}
							onClick={() => setPage((current) => Math.max(1, current - 1))}
						>
							<ChevronLeft aria-hidden="true" data-icon="inline-start" />
							Trước
						</Button>

						<span className="text-muted-foreground px-1 text-sm tabular-nums">
							Trang {pagination.page} / {Math.max(pagination.total_pages, 1)}
						</span>

						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isLoading || page >= pagination.total_pages}
							onClick={() => setPage((current) => current + 1)}
						>
							Sau
							<ChevronRight aria-hidden="true" data-icon="inline-end" />
						</Button>
					</div>
				</nav>
			) : null}
		</div>
	);
}
