"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleOff, Package, RotateCcw, Search, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { CreateServiceDialog } from "@/features/services/components/create-service-dialog";
import { EditServiceDialog } from "@/features/services/components/edit-service-dialog";
import { useCanManageServices } from "@/features/services/hooks/use-can-manage-services";
import { useServices } from "@/features/services/hooks/use-services";
import type { Service } from "@/features/services/types";
import { formatCurrency } from "@/lib/format";

type ServiceStatusFilter = "all" | "active" | "inactive";

function normalizeSearchText(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("vi-VN");
}

function getUnitLabel(unit: Service["unit"]) {
	return SERVICE_UNIT_LABEL[unit] ?? unit;
}

function ServicesDirectorySkeleton() {
	return (
		<div role="status" aria-live="polite" className="space-y-6">
			<span className="sr-only">Đang tải danh sách dịch vụ...</span>

			<div
				aria-hidden="true"
				className="border-border bg-card grid animate-pulse grid-cols-1 overflow-hidden rounded-2xl border shadow-sm motion-reduce:animate-none sm:grid-cols-3"
			>
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						key={index}
						className="border-border space-y-5 border-b p-5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
					>
						<div className="bg-muted size-9 rounded-xl" />
						<div className="space-y-2">
							<div className="bg-muted h-7 w-16 rounded-md" />
							<div className="bg-muted h-4 w-28 rounded-md" />
						</div>
					</div>
				))}
			</div>

			<div
				aria-hidden="true"
				className="border-border bg-card animate-pulse overflow-hidden rounded-2xl border shadow-sm motion-reduce:animate-none"
			>
				<div className="border-border flex items-center justify-between border-b px-5 py-4">
					<div className="space-y-2">
						<div className="bg-muted h-5 w-40 rounded-md" />
						<div className="bg-muted h-4 w-64 max-w-full rounded-md" />
					</div>
					<div className="bg-muted h-7 w-20 rounded-full" />
				</div>
				<div className="border-border grid gap-3 border-b p-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
					<div className="bg-muted h-11 rounded-md" />
					<div className="bg-muted h-11 rounded-md" />
				</div>
				<div className="divide-border divide-y px-5">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="grid gap-4 py-5 lg:grid-cols-4">
							<div className="bg-muted h-10 rounded-md lg:col-span-2" />
							<div className="bg-muted h-10 rounded-md" />
							<div className="bg-muted h-10 rounded-md" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function ServicesDirectory() {
	const { services, isLoading, error, refetch } = useServices();
	const canManageServices = useCanManageServices();
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("all");

	const activeServiceCount = services.filter((service) => service.is_active).length;
	const inactiveServiceCount = services.length - activeServiceCount;

	const filteredServices = useMemo(() => {
		const normalizedQuery = normalizeSearchText(query.trim());

		return services.filter((service) => {
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" && service.is_active) ||
				(statusFilter === "inactive" && !service.is_active);

			if (!matchesStatus) return false;
			if (!normalizedQuery) return true;

			return normalizeSearchText(
				`${service.name} ${service.description ?? ""} ${getUnitLabel(service.unit)}`
			).includes(normalizedQuery);
		});
	}, [query, services, statusFilter]);

	function resetFilters() {
		setQuery("");
		setStatusFilter("all");
	}

	if (isLoading) {
		return <ServicesDirectorySkeleton />;
	}

	if (error) {
		return (
			<section
				role="alert"
				aria-labelledby="services-error-title"
				className="border-destructive/30 bg-destructive/5 rounded-2xl border px-5 py-10 text-center shadow-sm"
			>
				<div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-2xl">
					<CircleOff aria-hidden="true" strokeWidth={1.8} className="size-5" />
				</div>
				<h2 id="services-error-title" className="mt-4 text-lg font-semibold">
					Không thể tải bảng giá dịch vụ
				</h2>
				<p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
					{error} Kiểm tra kết nối backend rồi thử lại.
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
		);
	}

	return (
		<div className="space-y-6">
			<section
				aria-label="Tổng quan dịch vụ"
				className="border-border bg-card grid grid-cols-1 overflow-hidden rounded-2xl border shadow-sm sm:grid-cols-3"
			>
				<div className="border-border flex min-h-36 flex-col justify-between border-b p-5 sm:border-r sm:border-b-0 sm:p-6">
					<Tags aria-hidden="true" strokeWidth={1.8} className="text-primary size-5" />
					<div className="mt-6">
						<p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
							{services.length}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">Tổng dịch vụ</p>
					</div>
				</div>

				<div className="border-border flex min-h-36 flex-col justify-between border-b p-5 sm:border-r sm:border-b-0 sm:p-6">
					<CircleCheck
						aria-hidden="true"
						strokeWidth={1.8}
						className="text-success size-5"
					/>
					<div className="mt-6">
						<p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
							{activeServiceCount}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">Đang cung cấp</p>
					</div>
				</div>

				<div className="flex min-h-36 flex-col justify-between p-5 sm:p-6">
					<CircleOff
						aria-hidden="true"
						strokeWidth={1.8}
						className="text-destructive size-5"
					/>
					<div className="mt-6">
						<p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
							{inactiveServiceCount}
						</p>
						<p className="text-muted-foreground mt-1 text-sm">Tạm ngừng</p>
					</div>
				</div>
			</section>

			<section
				aria-labelledby="services-directory-title"
				className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
			>
				<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2
							id="services-directory-title"
							className="text-card-foreground text-lg font-semibold tracking-tight"
						>
							Bảng giá dịch vụ
						</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							Tra cứu giá, đơn vị tính và trạng thái cung cấp.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="h-7 px-2.5 font-mono tabular-nums">
							{filteredServices.length} dịch vụ
						</Badge>
						{canManageServices ? (
							<CreateServiceDialog onCreated={() => refetch()} />
						) : null}
					</div>
				</header>

				<div className="border-border grid gap-3 border-b p-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
					<div className="relative">
						<label htmlFor="service-search" className="sr-only">
							Tìm dịch vụ
						</label>
						<Search
							aria-hidden="true"
							strokeWidth={1.8}
							className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
						/>
						<Input
							id="service-search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Tìm theo tên, mô tả hoặc đơn vị"
							className="h-11 pl-10"
						/>
					</div>

					<Select
						value={statusFilter}
						onValueChange={(value) => setStatusFilter(value as ServiceStatusFilter)}
					>
						<SelectTrigger aria-label="Lọc theo trạng thái" className="h-11 w-full">
							<SelectValue placeholder="Trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả trạng thái</SelectItem>
							<SelectItem value="active">Đang cung cấp</SelectItem>
							<SelectItem value="inactive">Tạm ngừng</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{filteredServices.length > 0 ? (
					<>
						<div className="bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(15rem,1.35fr)_minmax(9rem,0.65fr)_minmax(10rem,0.75fr)_minmax(9rem,0.65fr)] gap-4 px-5 py-3 text-xs font-medium lg:grid">
							<span>Dịch vụ</span>
							<span>Đơn vị</span>
							<span className="text-right">Đơn giá</span>
							<span className="text-right">Trạng thái</span>
						</div>

						<div className="divide-border divide-y">
							{filteredServices.map((service) => (
								<article
									key={service.id}
									className="hover:bg-muted/35 grid gap-4 px-5 py-4 transition-colors lg:grid-cols-[minmax(15rem,1.35fr)_minmax(9rem,0.65fr)_minmax(10rem,0.75fr)_minmax(9rem,0.65fr)] lg:items-center"
								>
									<div className="flex min-w-0 items-start gap-3">
										<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
											<Package
												aria-hidden="true"
												strokeWidth={1.8}
												className="size-4"
											/>
										</div>
										<div className="min-w-0">
											<h3 className="truncate text-sm font-semibold">
												{service.name}
											</h3>
											<p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
												{service.description ||
													"Chưa có mô tả cho dịch vụ này."}
											</p>
										</div>
									</div>

									<div>
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Đơn vị
										</p>
										<p className="text-sm font-medium">
											{getUnitLabel(service.unit)}
										</p>
									</div>

									<div className="lg:text-right">
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Đơn giá
										</p>
										<p className="font-mono text-sm font-semibold whitespace-nowrap tabular-nums">
											{formatCurrency(Number(service.unit_price))}
										</p>
									</div>

									<div>
										<p className="text-muted-foreground mb-1 text-xs lg:hidden">
											Trạng thái
										</p>
										<div className="flex items-center gap-2 lg:justify-end">
											<Badge
												variant="outline"
												className={
													service.is_active
														? "border-success/30 bg-success/10 text-success"
														: "border-destructive/30 bg-destructive/10 text-destructive"
												}
											>
												{service.is_active ? (
													<CircleCheck aria-hidden="true" />
												) : (
													<CircleOff aria-hidden="true" />
												)}
												{service.is_active ? "Đang cung cấp" : "Tạm ngừng"}
											</Badge>
											{canManageServices ? (
												<EditServiceDialog
													service={service}
													onUpdated={() => refetch()}
												/>
											) : null}
										</div>
									</div>
								</article>
							))}
						</div>
					</>
				) : (
					<div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
						<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
							<Package aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<h3 className="mt-4 text-base font-semibold">
							{services.length === 0 ? "Chưa có dịch vụ" : "Không có dịch vụ phù hợp"}
						</h3>
						<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
							{services.length === 0
								? "Dịch vụ mới sẽ xuất hiện tại đây sau khi được thêm vào hệ thống."
								: "Thử từ khóa khác hoặc xóa bộ lọc để xem lại toàn bộ bảng giá."}
						</p>
						{services.length > 0 ? (
							<Button
								type="button"
								variant="outline"
								className="mt-5"
								onClick={resetFilters}
							>
								<RotateCcw aria-hidden="true" data-icon="inline-start" />
								Xóa bộ lọc
							</Button>
						) : null}
					</div>
				)}
			</section>
		</div>
	);
}
