import { AttentionOrdersTable } from "@/features/dashboard/components/attention-orders-table";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getAttentionOrders } from "@/features/dashboard/services/get-attention-orders";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";

export default async function OrdersPage() {
	const attentionOrders = await getAttentionOrders();
	const dashboardStats = await getDashboardStats();

	return (
		<div className="space-y-6">
			<DashboardStats stats={dashboardStats} />
			<AttentionOrdersTable orders={attentionOrders} />
		</div>
	);
}
