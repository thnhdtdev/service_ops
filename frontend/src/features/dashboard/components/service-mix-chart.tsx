"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartPie, CircleAlert, RefreshCcw } from "lucide-react";
import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
	RevenueChartPeriod,
	ServiceMixData,
	ServiceMixDataPoint,
	ServiceMixMetric
} from "@/features/dashboard/types";

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--muted-foreground)"
];

const PERIOD_OPTIONS: { value: RevenueChartPeriod; label: string }[] = [
	{ value: "week", label: "7 ngày" },
	{ value: "month", label: "Tháng này" }
];

const METRIC_OPTIONS: { value: ServiceMixMetric; label: string }[] = [
	{ value: "revenue", label: "Doanh thu" },
	{ value: "selections", label: "Lượt chọn" }
];

const percentageFormatter = new Intl.NumberFormat("vi-VN", {
	maximumFractionDigits: 1
});

const countFormatter = new Intl.NumberFormat("vi-VN");

type ServiceMixChartProps = {
	data: ServiceMixData;
	error: string | null;
};

type ChartDataPoint = ServiceMixDataPoint & {
	color: string;
	percentage: number;
};

function formatPercentage(value: number) {
	return `${percentageFormatter.format(value)}%`;
}

function formatMetricValue(value: number, metric: ServiceMixMetric) {
	return metric === "revenue" ? formatCurrency(value) : `${countFormatter.format(value)} lượt`;
}

function createChartData(data: ServiceMixDataPoint[]): ChartDataPoint[] {
	const sortedData = [...data].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
	const total = sortedData.reduce((sum, item) => sum + item.value, 0);
	const leadingServices = sortedData.slice(0, 5);
	const remainingServices = sortedData.slice(5);
	const remainingValue = remainingServices.reduce((sum, item) => sum + item.value, 0);
	const visibleData = [...leadingServices];

	if (remainingValue > 0) {
		visibleData.push({
			serviceId: "other-services",
			serviceName: "Khác",
			value: remainingValue
		});
	}

	return visibleData.map((item, index) => ({
		...item,
		color: CHART_COLORS[index],
		percentage: total > 0 ? (item.value / total) * 100 : 0
	}));
}

function ServiceMixTooltip({ active, payload }: TooltipContentProps) {
	const point = payload?.[0]?.payload as ChartDataPoint | undefined;

	if (!active || !point) {
		return null;
	}

	return (
		<div className="border-border bg-popover text-popover-foreground min-w-44 rounded-lg border px-3 py-2.5 shadow-md">
			<p className="font-medium">{point.serviceName}</p>
			<p className="text-muted-foreground mt-1 text-xs tabular-nums">
				{formatPercentage(point.percentage)}
			</p>
		</div>
	);
}

export function ServiceMixChart({ data, error }: ServiceMixChartProps) {
	const router = useRouter();
	const [period, setPeriod] = useState<RevenueChartPeriod>("week");
	const [metric, setMetric] = useState<ServiceMixMetric>("revenue");
	const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
	const chartData = useMemo(() => createChartData(data[period][metric]), [data, metric, period]);
	const activePoint =
		chartData.find((item) => item.serviceId === activeServiceId) ?? chartData.at(0);
	const isEmpty = chartData.length === 0;
	const metricDescription =
		metric === "revenue"
			? "Tỷ trọng tiền đã thu theo ngày thanh toán."
			: "Tỷ trọng dịch vụ trong các đơn được tạo.";

	return (
		<Card className="h-full gap-0 rounded-2xl py-0 shadow-sm">
			<CardHeader className="border-border gap-4 border-b p-5 sm:p-6">
				<div>
					<h2 id="service-mix-title" className="text-foreground text-base font-semibold">
						Cơ cấu dịch vụ
					</h2>
					<p id="service-mix-description" className="text-muted-foreground mt-1 text-sm">
						Nhận diện dịch vụ đóng góp lớn nhất.
					</p>
				</div>

				<div
					role="group"
					aria-label="Chọn khoảng thời gian cơ cấu dịch vụ"
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
								onClick={() => {
									setPeriod(option.value);
									setActiveServiceId(null);
								}}
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

			<CardContent className="p-5 sm:p-6">
				{error ? (
					<div
						role="alert"
						className="flex min-h-96 flex-col items-center justify-center text-center"
					>
						<div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-xl">
							<CircleAlert aria-hidden="true" className="size-5" />
						</div>
						<p className="text-foreground mt-4 font-semibold">Không thể tải biểu đồ</p>
						<p className="text-muted-foreground mt-1 max-w-xs text-sm leading-6">
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
				) : (
					<figure
						aria-labelledby="service-mix-title"
						aria-describedby="service-mix-description service-mix-metric-description"
					>
						<div
							role="group"
							aria-label="Chọn cách phân tích dịch vụ"
							className="bg-muted grid grid-cols-2 rounded-lg p-1"
						>
							{METRIC_OPTIONS.map((option) => {
								const isSelected = metric === option.value;

								return (
									<Button
										key={option.value}
										type="button"
										variant="ghost"
										size="sm"
										aria-pressed={isSelected}
										onClick={() => {
											setMetric(option.value);
											setActiveServiceId(null);
										}}
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

						<p
							id="service-mix-metric-description"
							className="text-muted-foreground mt-3 text-xs leading-5"
						>
							{metricDescription}
						</p>

						{isEmpty ? (
							<div
								role="status"
								className="flex min-h-80 flex-col items-center justify-center text-center"
							>
								<div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-xl">
									<ChartPie aria-hidden="true" className="size-5" />
								</div>
								<p className="text-foreground mt-4 font-semibold">
									Chưa có dữ liệu dịch vụ
								</p>
								<p className="text-muted-foreground mt-1 max-w-xs text-sm leading-6">
									Chưa có dữ liệu phù hợp trong khoảng thời gian này.
								</p>
							</div>
						) : (
							<>
								<div className="relative mx-auto mt-2 h-56 max-w-72">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart accessibilityLayer>
											<Pie
												data={chartData}
												dataKey="value"
												nameKey="serviceName"
												innerRadius={62}
												outerRadius={88}
												paddingAngle={2}
												stroke="var(--card)"
												strokeWidth={3}
												isAnimationActive={false}
												onMouseEnter={(_, index) => {
													setActiveServiceId(
														chartData[index]?.serviceId ?? null
													);
												}}
											>
												{chartData.map((item) => (
													<Cell key={item.serviceId} fill={item.color} />
												))}
											</Pie>
											<Tooltip
												content={ServiceMixTooltip}
												isAnimationActive={false}
											/>
										</PieChart>
									</ResponsiveContainer>

									{activePoint ? (
										<div
											aria-live="polite"
											aria-atomic="true"
											className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-20 text-center"
										>
											<span className="text-foreground text-xl font-bold tracking-tight tabular-nums">
												{formatPercentage(activePoint.percentage)}
											</span>
											<span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-4">
												{activePoint.serviceName}
											</span>
										</div>
									) : null}
								</div>

								<ul aria-label="Chú thích màu dịch vụ" className="mt-2 space-y-1">
									{chartData.map((item) => {
										const isActive = activePoint?.serviceId === item.serviceId;

										return (
											<li key={item.serviceId}>
												<button
													type="button"
													aria-pressed={isActive}
													onClick={() =>
														setActiveServiceId(item.serviceId)
													}
													onFocus={() =>
														setActiveServiceId(item.serviceId)
													}
													onMouseEnter={() =>
														setActiveServiceId(item.serviceId)
													}
													className={cn(
														"hover:bg-muted/70 focus-visible:ring-ring grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none focus-visible:ring-2",
														isActive && "bg-muted"
													)}
												>
													<span
														aria-hidden="true"
														className="size-2.5 rounded-sm"
														style={{ backgroundColor: item.color }}
													/>
													<span className="min-w-0">
														<span className="text-foreground block truncate text-sm font-medium">
															{item.serviceName}
														</span>
														<span className="text-muted-foreground block truncate text-xs tabular-nums">
															{formatMetricValue(item.value, metric)}
														</span>
													</span>
													<span className="text-foreground text-sm font-semibold tabular-nums">
														{formatPercentage(item.percentage)}
													</span>
												</button>
											</li>
										);
									})}
								</ul>

								<table className="sr-only">
									<caption>
										Cơ cấu dịch vụ theo{" "}
										{metric === "revenue" ? "doanh thu" : "lượt chọn"}
									</caption>
									<thead>
										<tr>
											<th scope="col">Dịch vụ</th>
											<th scope="col">Giá trị</th>
											<th scope="col">Tỷ lệ</th>
										</tr>
									</thead>
									<tbody>
										{chartData.map((item) => (
											<tr key={item.serviceId}>
												<td>{item.serviceName}</td>
												<td>{formatMetricValue(item.value, metric)}</td>
												<td>{formatPercentage(item.percentage)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</>
						)}
					</figure>
				)}
			</CardContent>
		</Card>
	);
}

export function ServiceMixChartSkeleton() {
	return (
		<Card role="status" aria-live="polite" className="h-full gap-0 rounded-2xl py-0 shadow-sm">
			<span className="sr-only">Đang tải biểu đồ cơ cấu dịch vụ...</span>

			<div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
				<CardHeader className="border-border gap-4 border-b p-5 sm:p-6">
					<div className="space-y-2">
						<div className="bg-muted h-5 w-36 rounded-md" />
						<div className="bg-muted h-4 w-56 max-w-full rounded-md" />
					</div>
					<div className="bg-muted h-10 w-full rounded-lg" />
				</CardHeader>

				<CardContent className="space-y-4 p-5 sm:p-6">
					<div className="bg-muted h-10 w-full rounded-lg" />
					<div className="bg-muted mx-auto size-52 rounded-full" />
					<div className="space-y-2">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="bg-muted h-12 rounded-lg" />
						))}
					</div>
				</CardContent>
			</div>
		</Card>
	);
}
