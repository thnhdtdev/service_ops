import { Banknote, ClipboardList, WalletCards } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { DashboardStats as DashboardStatsType } from "@/features/dashboard/types";

import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsProps = {
	stats: DashboardStatsType;
};

// 4 columns on wide screens: today's revenue takes 2, the others 1 each.
// On tablets the revenue card has its own row and the other two share one,
// so no card is ever left alone on a row.
export function DashboardStats({ stats }: DashboardStatsProps) {
	return (
		<section aria-label="Số liệu hôm nay" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<DashboardStatCard
				featured
				className="sm:col-span-2"
				title="Doanh thu hôm nay"
				value={formatCurrency(stats.todayRevenue)}
				detail={`Từ ${stats.ordersWithPaymentToday} đơn có thanh toán`}
				icon={Banknote}
			/>

			<DashboardStatCard
				title="Đơn hôm nay"
				value={stats.ordersToday}
				detail={`Tổng giá trị ${formatCurrency(stats.todayOrderValue)}`}
				icon={ClipboardList}
			/>

			<DashboardStatCard
				title="Chưa thanh toán"
				value={stats.unpaidOrders}
				detail="Đơn còn chưa thu đủ tiền"
				icon={WalletCards}
			/>
		</section>
	);
}
