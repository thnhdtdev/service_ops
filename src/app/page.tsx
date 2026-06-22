import { AttentionOrdersTable } from "@/features/dashboard/components/attention-orders-table";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getAttentionOrders } from "@/features/dashboard/api/get-attention-orders";
import { dashboardStatsMock } from "@/features/dashboard/services/dashboard.mock";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardPage() {
	const attentionOrders = await getAttentionOrders();

	return (
		<DashboardShell>
			<div className="space-y-6">
				<DashboardStats stats={dashboardStatsMock} />

				<AttentionOrdersTable orders={attentionOrders} />
			</div>
		</DashboardShell>
	);
}
