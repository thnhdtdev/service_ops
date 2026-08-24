import Link from "next/link";
import { CalendarDays, ChevronRight, Search, UserPlus, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { getCustomerDirectory } from "@/features/customers/services/get-customer-directory";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

type CustomersPageProps = {
	searchParams: Promise<{
		q?: string | string[];
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

function formatDate(value: string | null) {
	if (!value) return "Chưa có đơn";

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? "Không xác định" : dateFormatter.format(date);
}

function formatPhone(phone: string | null) {
	if (!phone) return "Chưa có số điện thoại";

	const digits = phone.replace(/\D/g, "");

	if (digits.length === 10 && digits.startsWith("0")) {
		return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
	}

	return phone;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
	const params = await searchParams;
	const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
	const query = rawQuery?.trim() ?? "";
	const directory = await getCustomerDirectory(query);

	return (
		<div className="space-y-6">
			<section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.75fr)]">
				<form
					action="/customers"
					method="get"
					className="border-border bg-card rounded-2xl border p-5 shadow-sm sm:p-6"
				>
					<div className="max-w-2xl">
						<h2 className="text-card-foreground text-lg font-semibold tracking-tight">
							Tìm đúng khách, tạo đơn nhanh hơn
						</h2>
						<p className="text-muted-foreground mt-1.5 text-sm leading-6">
							Tra cứu bằng tên hoặc số điện thoại đã dùng khi tạo đơn.
						</p>
					</div>

					<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
						<div className="min-w-0 flex-1 space-y-2">
							<label htmlFor="customer-search" className="text-sm font-medium">
								Tên hoặc số điện thoại
							</label>
							<div className="relative">
								<Search
									aria-hidden="true"
									strokeWidth={1.8}
									className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
								/>
								<Input
									id="customer-search"
									name="q"
									defaultValue={query}
									placeholder="Ví dụ: 0912 345 678 hoặc Nguyễn An"
									className="h-11 pl-10"
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Button type="submit" size="lg" className="h-11">
								Tìm khách
							</Button>
							{query ? (
								<Button asChild variant="outline" size="lg" className="h-11">
									<Link href="/customers">Xóa lọc</Link>
								</Button>
							) : null}
						</div>
					</div>
				</form>

				<div className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-2xl border shadow-sm">
					<div className="flex min-h-36 flex-col justify-between p-5 sm:p-6">
						<UsersRound
							aria-hidden="true"
							strokeWidth={1.8}
							className="text-primary size-5"
						/>
						<div className="mt-6">
							<p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
								{directory.totalCustomerCount}
							</p>
							<p className="text-muted-foreground mt-1 text-xs leading-5 sm:text-sm">
								Tổng khách hàng
							</p>
						</div>
					</div>

					<div className="border-border flex min-h-36 flex-col justify-between border-l p-5 sm:p-6">
						<UserPlus
							aria-hidden="true"
							strokeWidth={1.8}
							className="text-primary size-5"
						/>
						<div className="mt-6">
							<p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
								{directory.newCustomerCountThisMonth}
							</p>
							<p className="text-muted-foreground mt-1 text-xs leading-5 sm:text-sm">
								Khách mới tháng này
							</p>
						</div>
					</div>
				</div>
			</section>

			<section
				aria-labelledby="customer-directory-title"
				className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
			>
				<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2
							id="customer-directory-title"
							className="text-card-foreground text-lg font-semibold tracking-tight"
						>
							Danh bạ khách hàng
						</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							{query
								? `Kết quả phù hợp với “${query}”`
								: "Thông tin được tổng hợp từ các đơn hàng đã tạo."}
						</p>
					</div>
					<Badge variant="secondary" className="h-7 px-2.5 font-mono tabular-nums">
						{directory.matchingCustomerCount} khách hàng
					</Badge>
				</header>

				{directory.customers.length > 0 ? (
					<>
						<div className="bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(14rem,1.4fr)_minmax(9rem,0.85fr)_minmax(8rem,0.7fr)_minmax(8rem,0.75fr)_minmax(9rem,0.85fr)] gap-4 px-5 py-3 text-xs font-medium lg:grid">
							<span>Khách hàng</span>
							<span>Liên hệ</span>
							<span>Đơn hàng</span>
							<span>Gần nhất</span>
							<span className="text-right">Giá trị đơn</span>
						</div>

						<div className="divide-border divide-y">
							{directory.customers.map((customer) => (
								<article
									key={customer.id}
									className="hover:bg-muted/35 grid gap-4 px-5 py-4 transition-colors lg:grid-cols-[minmax(14rem,1.4fr)_minmax(9rem,0.85fr)_minmax(8rem,0.7fr)_minmax(8rem,0.75fr)_minmax(9rem,0.85fr)] lg:items-center"
								>
									<Link
										href={`/customers/${customer.id}`}
										aria-label={`Xem hồ sơ và lịch sử đơn của ${customer.name}`}
										className="group/customer focus-visible:ring-ring -m-1 flex min-w-0 items-center gap-3 rounded-lg p-1 outline-none focus-visible:ring-2"
									>
										<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
											{getInitials(customer.name)}
										</div>
										<div className="min-w-0">
											<h3 className="truncate text-sm font-semibold">
												{customer.name}
											</h3>
											<p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
												<CalendarDays
													aria-hidden="true"
													strokeWidth={1.8}
													className="size-3.5"
												/>
												Từ {formatDate(customer.createdAt)}
											</p>
										</div>
										<ChevronRight
											aria-hidden="true"
											strokeWidth={1.8}
											className="text-muted-foreground ml-auto size-4 shrink-0 transition-transform group-hover/customer:translate-x-0.5"
										/>
									</Link>

									<div className="min-w-0">
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Liên hệ
										</p>
										{customer.phone ? (
											<a
												href={`tel:${customer.phone}`}
												className="hover:text-primary block truncate text-sm font-medium transition-colors"
											>
												{formatPhone(customer.phone)}
											</a>
										) : (
											<p className="text-muted-foreground text-sm">
												Chưa có số điện thoại
											</p>
										)}
									</div>

									<div>
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Đơn hàng
										</p>
										<p className="font-mono text-sm font-semibold tabular-nums">
											{customer.orderCount} đơn
										</p>
										{customer.unpaidOrderCount > 0 ? (
											<p className="text-warning mt-1 text-xs">
												{customer.unpaidOrderCount} chưa thanh toán
											</p>
										) : null}
									</div>

									<div>
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Đơn gần nhất
										</p>
										<p className="text-sm">
											{formatDate(customer.lastOrderAt)}
										</p>
									</div>

									<div className="lg:text-right">
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Giá trị đơn
										</p>
										<p className="font-mono text-sm font-semibold whitespace-nowrap tabular-nums">
											{formatCurrency(customer.totalOrderValue)}
										</p>
									</div>
								</article>
							))}
						</div>

						{directory.isLimited ? (
							<p className="border-border text-muted-foreground border-t px-5 py-3 text-center text-xs">
								Đang hiển thị 50 khách hàng gần nhất. Dùng ô tìm kiếm để thu hẹp
								danh sách.
							</p>
						) : null}
					</>
				) : (
					<div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
						<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
							<UsersRound aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<h3 className="mt-4 text-base font-semibold">
							{query ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
						</h3>
						<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
							{query
								? "Kiểm tra lại tên, số điện thoại hoặc xóa bộ lọc để xem toàn bộ danh bạ."
								: "Khách hàng sẽ xuất hiện tại đây sau khi bạn tạo đơn hàng đầu tiên."}
						</p>
						{query ? (
							<Button asChild variant="outline" className="mt-5">
								<Link href="/customers">Xem toàn bộ</Link>
							</Button>
						) : null}
					</div>
				)}
			</section>
		</div>
	);
}
