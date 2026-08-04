import { RevenueChart, RevenueChartSkeleton } from "@/features/dashboard/components/revenue-chart";
import { getRevenueChartData } from "@/features/dashboard/services/get-revenue-chart-data";

export async function RevenueChartSection() {
	const result = await getRevenueChartData();

	return <RevenueChart data={result.data} error={result.error} />;
}

export { RevenueChartSkeleton };
