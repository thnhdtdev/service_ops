import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { OrdersList } from "@/features/orders/components/orders-list";


export default async function OrdersPage() {
	const dashboardStats = await getDashboardStats();

	return (
		<div className="space-y-6">
			<DashboardStats stats={dashboardStats} />
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Đơn hàng
				</h1>

				<p className="text-muted-foreground mt-1 text-sm">
					Quản lý và theo dõi tất cả đơn hàng.
				</p>
			</div>

			<OrdersList />
		</div>
	);
}
