import { AttentionOrdersTable } from "@/features/dashboard/components/attention-orders-table";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getAttentionOrders } from "@/features/dashboard/services/get-attention-orders";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats.ts";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardPage() {
	const [dashboardStats, attentionOrders] = await Promise.all([
		getDashboardStats(),
		getAttentionOrders()
	]);
	return (
		<DashboardShell>
			<div className="space-y-6">
				<DashboardStats stats={dashboardStats} />
				<AttentionOrdersTable orders={attentionOrders} />
			</div>
		</DashboardShell>
	);
}
