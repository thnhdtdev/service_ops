"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CircleAlert, RefreshCcw } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	type TooltipContentProps
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type {
	RevenueChartData,
	RevenueChartPeriod,
	RevenueDataPoint
} from "@/features/dashboard/types";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const weekdayFormatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: VIETNAM_TIME_ZONE,
	weekday: "short"
});

const dayFormatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: VIETNAM_TIME_ZONE,
	day: "2-digit"
});

const longDateFormatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: VIETNAM_TIME_ZONE,
	weekday: "long",
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: VIETNAM_TIME_ZONE,
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
});

const compactNumberFormatter = new Intl.NumberFormat("vi-VN", {
	notation: "compact",
	maximumFractionDigits: 1
});

const PERIOD_OPTIONS: { value: RevenueChartPeriod; label: string }[] = [
	{ value: "week", label: "7 ngày" },
	{ value: "month", label: "Tháng này" }
];

type RevenueChartProps = {
	data: RevenueChartData;
	error: string | null;
};

function parseDateKey(dateKey: string) {
	return new Date(`${dateKey}T00:00:00+07:00`);
}

function formatAxisLabel(dateKey: string, period: RevenueChartPeriod) {
	const formatter = period === "week" ? weekdayFormatter : dayFormatter;

	return formatter.format(parseDateKey(dateKey));
}

function formatLongDate(dateKey: string) {
	return longDateFormatter.format(parseDateKey(dateKey));
}

function formatShortDate(dateKey: string) {
	return shortDateFormatter.format(parseDateKey(dateKey));
}

function formatCompactNumber(value: number) {
	return compactNumberFormatter.format(value);
}

function formatRangeLabel(data: RevenueDataPoint[]) {
	const firstPoint = data.at(0);
	const lastPoint = data.at(-1);

	if (!firstPoint || !lastPoint) {
		return "Chưa xác định khoảng thời gian";
	}

	return `Từ ${formatShortDate(firstPoint.date)} đến ${formatShortDate(lastPoint.date)}`;
}

// The day with the most revenue, or null when there is no data.
function findBestDay(data: RevenueDataPoint[]) {
	let bestDay: RevenueDataPoint | null = null;

	for (const point of data) {
		if (!bestDay || point.amount > bestDay.amount) {
			bestDay = point;
		}
	}

	return bestDay;
}

function RevenueTooltip({ active, payload }: TooltipContentProps) {
	const point = payload?.[0]?.payload as RevenueDataPoint | undefined;

	if (!active || !point) {
		return null;
	}

	return (
		<div className="border-border bg-popover text-popover-foreground min-w-44 rounded-lg border px-3 py-2.5 shadow-md">
			<p className="text-muted-foreground text-xs">{formatLongDate(point.date)}</p>
			<p className="mt-1 font-semibold tabular-nums">{formatCurrency(point.amount)}</p>
		</div>
	);
}

export function RevenueChart({ data, error }: RevenueChartProps) {
	const router = useRouter();
	const [period, setPeriod] = useState<RevenueChartPeriod>("week");
	const selectedData = data[period];
	const totalRevenue = useMemo(() => {
		return selectedData.reduce((total, point) => total + point.amount, 0);
	}, [selectedData]);
	// Both series end today, so this is the average over the days so far.
	const averageRevenue =
		selectedData.length > 0 ? Math.round(totalRevenue / selectedData.length) : 0;
	const bestDay = findBestDay(selectedData);
	const isEmpty = selectedData.every((point) => point.amount === 0);
	const needsHorizontalScroll = period === "month" && selectedData.length > 14;

	return (
		// h-full + flex-1 below: the card stretches to the height of the
		// service mix card next to it, and the chart fills the extra space.
		<Card className="h-full gap-0 rounded-2xl py-0 shadow-sm">
			<CardHeader className="border-border gap-4 border-b p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
				<div className="min-w-0">
					<h2
						id="revenue-chart-title"
						className="text-foreground text-base font-semibold"
					>
						Doanh thu theo ngày
					</h2>
					<p
						id="revenue-chart-description"
						className="text-muted-foreground mt-1 text-sm"
					>
						Số tiền đã thu từ các khoản thanh toán.
					</p>
				</div>

				<div
					role="group"
					aria-label="Chọn khoảng thời gian doanh thu"
					className="bg-muted grid grid-cols-2 rounded-lg p-1"
				>
					{PERIOD_OPTIONS.map((option) => {
						const isSelected = period === option.value;

						return (
							<Button
								key={option.value}
								type="button"
								variant="ghost"
								size="sm"
								aria-pressed={isSelected}
								onClick={() => setPeriod(option.value)}
								className={cn(
									"rounded-md px-3",
									isSelected &&
										"bg-background text-foreground hover:bg-background shadow-xs"
								)}
							>
								{option.label}
							</Button>
						);
					})}
				</div>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col p-5 sm:p-6">
				{error ? (
					<div
						role="alert"
						className="flex min-h-72 flex-1 flex-col items-center justify-center text-center"
					>
						<div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-xl">
							<CircleAlert aria-hidden="true" className="size-5" />
						</div>
						<p className="text-foreground mt-4 font-semibold">Không thể tải biểu đồ</p>
						<p className="text-muted-foreground mt-1 max-w-sm text-sm leading-6">
							{error}
						</p>
						<Button
							type="button"
							variant="outline"
							className="mt-4"
							onClick={() => router.refresh()}
						>
							<RefreshCcw aria-hidden="true" />
							Thử lại
						</Button>
					</div>
				) : isEmpty ? (
					<div
						role="status"
						className="flex min-h-72 flex-1 flex-col items-center justify-center text-center"
					>
						<div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-xl">
							<BarChart3 aria-hidden="true" className="size-5" />
						</div>
						<p className="text-foreground mt-4 font-semibold">Chưa có doanh thu</p>
						<p className="text-muted-foreground mt-1 max-w-sm text-sm leading-6">
							Chưa có khoản thanh toán nào trong khoảng thời gian này.
						</p>
					</div>
				) : (
					<figure
						aria-labelledby="revenue-chart-title"
						aria-describedby="revenue-chart-description revenue-chart-range"
						className="flex flex-1 flex-col"
					>
						<dl
							aria-live="polite"
							aria-atomic="true"
							className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3"
						>
							<div className="col-span-2 sm:col-span-1">
								<dt className="text-muted-foreground text-xs font-medium">
									Tổng tiền đã thu
								</dt>
								<dd className="text-foreground mt-1 text-2xl font-bold tracking-tight tabular-nums">
									{formatCurrency(totalRevenue)}
								</dd>
							</div>
							<div>
								<dt className="text-muted-foreground text-xs font-medium">
									Trung bình mỗi ngày
								</dt>
								<dd className="text-foreground mt-1 text-base font-semibold tabular-nums">
									{formatCurrency(averageRevenue)}
								</dd>
							</div>
							{bestDay ? (
								<div>
									<dt className="text-muted-foreground text-xs font-medium">
										Ngày thu cao nhất
									</dt>
									<dd className="text-foreground mt-1 text-base font-semibold tabular-nums">
										{formatCurrency(bestDay.amount)}
									</dd>
									<dd className="text-muted-foreground text-xs tabular-nums">
										{formatShortDate(bestDay.date)}
									</dd>
								</div>
							) : null}
						</dl>

						<div className="-mx-2 flex flex-1 flex-col overflow-x-auto px-2 pb-1">
							<div
								className={cn(
									"min-h-72 w-full flex-1",
									needsHorizontalScroll && "min-w-170 md:min-w-0"
								)}
							>
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={selectedData}
										accessibilityLayer
										margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
									>
										<CartesianGrid
											vertical={false}
											stroke="var(--border)"
											strokeDasharray="3 3"
										/>
										<XAxis
											dataKey="date"
											axisLine={false}
											tickLine={false}
											tickMargin={10}
											interval={period === "month" ? 2 : 0}
											tickFormatter={(value: string) =>
												formatAxisLabel(value, period)
											}
											tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
										/>
										<YAxis
											axisLine={false}
											tickLine={false}
											tickMargin={8}
											width={56}
											tickFormatter={formatCompactNumber}
											tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
										/>
										<Tooltip
											content={RevenueTooltip}
											cursor={{ fill: "var(--muted)", opacity: 0.65 }}
											isAnimationActive={false}
										/>
										<Bar
											dataKey="amount"
											name="Doanh thu"
											fill="var(--primary)"
											maxBarSize={32}
											radius={[6, 6, 2, 2]}
											isAnimationActive={false}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						<p id="revenue-chart-range" className="text-muted-foreground mt-3 text-xs">
							{formatRangeLabel(selectedData)}
						</p>

						{needsHorizontalScroll ? (
							<p className="text-muted-foreground mt-1 text-xs md:hidden">
								Cuộn ngang để xem đầy đủ các ngày trong tháng.
							</p>
						) : null}

						<table className="sr-only">
							<caption>Doanh thu theo từng ngày</caption>
							<thead>
								<tr>
									<th scope="col">Ngày</th>
									<th scope="col">Doanh thu</th>
								</tr>
							</thead>
							<tbody>
								{selectedData.map((point) => (
									<tr key={point.date}>
										<td>{formatLongDate(point.date)}</td>
										<td>{formatCurrency(point.amount)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</figure>
				)}
			</CardContent>
		</Card>
	);
}

export function RevenueChartSkeleton() {
	return (
		<Card role="status" aria-live="polite" className="h-full gap-0 rounded-2xl py-0 shadow-sm">
			<span className="sr-only">Đang tải biểu đồ doanh thu...</span>

			<div
				aria-hidden="true"
				className="flex flex-1 animate-pulse flex-col motion-reduce:animate-none"
			>
				<CardHeader className="border-border gap-4 border-b p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
					<div className="space-y-2">
						<div className="bg-muted h-5 w-44 rounded-md" />
						<div className="bg-muted h-4 w-64 max-w-full rounded-md" />
					</div>
					<div className="bg-muted h-10 w-40 rounded-lg" />
				</CardHeader>

				<CardContent className="flex flex-1 flex-col p-5 sm:p-6">
					<div className="mb-5 space-y-2">
						<div className="bg-muted h-3 w-24 rounded-md" />
						<div className="bg-muted h-8 w-40 rounded-md" />
					</div>
					<div className="bg-muted min-h-72 flex-1 rounded-xl" />
				</CardContent>
			</div>
		</Card>
	);
}
