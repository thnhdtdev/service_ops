import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { OrdersList } from "@/features/orders/components/orders-list";

type OrdersPageProps = {
	// Next.js gives the URL query as a Promise, e.g. /orders?search=0901
	searchParams: Promise<{ search?: string | string[] }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
	const [dashboardStats, { search }] = await Promise.all([getDashboardStats(), searchParams]);
	// ?search=a&search=b gives an array: use the first one.
	const searchText = (Array.isArray(search) ? search[0] : search)?.trim() || undefined;

	return (
		<div className="space-y-6">
			<DashboardStats stats={dashboardStats} />
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>

				<p className="text-muted-foreground mt-1 text-sm">
					Quản lý và theo dõi tất cả đơn hàng.
				</p>
			</div>

			{/* key: a new search starts again from page 1. */}
			<OrdersList key={searchText ?? ""} search={searchText} />
		</div>
	);
}
