import { formatCurrency } from "@/lib/format";
import type { DashboardStats as DashboardStatsType } from "@/features/dashboard/types";
import { DASHBOARD_STATS_CONFIG } from "@/features/dashboard/config/dashboard-stats.config";

import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsProps = {
	stats: DashboardStatsType;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
	return (
		<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
			{DASHBOARD_STATS_CONFIG.map((item) => {
				const rawValue = stats[item.key];

				const value = item.format === "currency" ? formatCurrency(rawValue) : rawValue;

				return (
					<DashboardStatCard
						key={item.key}
						title={item.title}
						value={value}
						description={item.description}
						icon={item.icon}
					/>
				);
			})}
		</section>
	);
}
