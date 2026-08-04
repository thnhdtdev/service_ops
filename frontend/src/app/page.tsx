import { Suspense } from "react";

import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
	RevenueChartSection,
	RevenueChartSkeleton
} from "@/features/dashboard/components/revenue-chart-section";

export default async function DashboardPage() {
	const dashboardStats = await getDashboardStats();

	return (
		<DashboardShell>
			<div className="space-y-6">
				<DashboardStats stats={dashboardStats} />

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<Suspense fallback={<RevenueChartSkeleton />}>
							<RevenueChartSection />
						</Suspense>
					</div>
					<div>
						<div className="bg-card text-card-foreground flex h-[300px] items-center justify-center rounded-xl border p-6 shadow">
							Biểu đồ phân bổ dịch vụ
						</div>
					</div>
				</div>
			</div>
		</DashboardShell>
	);
}
