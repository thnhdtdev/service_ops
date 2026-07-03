import {
	Banknote,
	CheckCircle2,
	ClipboardList,
	ReceiptText,
	WalletCards,
	type LucideIcon
} from "lucide-react";

import type { DashboardStats } from "@/features/dashboard/types";

export type DashboardStatItem = {
	key: keyof DashboardStats;
	title: string;
	description: string;
	icon: LucideIcon;
	format?: "currency";
};

export const DASHBOARD_STATS_CONFIG: DashboardStatItem[] = [
	{
		key: "ordersToday",
		title: "Đơn hôm nay",
		description: "Tổng số đơn được tạo trong ngày",
		icon: ClipboardList
	},
	{
		key: "unpaidOrders",
		title: "Đơn chưa thanh toán",
		description: "Các đơn còn chưa thu tiền",
		icon: WalletCards
	},
	{
		key: "paidOrdersToday",
		title: "Đơn đã thanh toán hôm nay",
		description: "Số đơn đã được ghi nhận thanh toán hôm nay",
		icon: CheckCircle2
	},
	{
		key: "todayOrderValue",
		title: "Giá trị đơn hôm nay",
		description: "Tổng giá trị các đơn được tạo trong ngày",
		icon: ReceiptText,
		format: "currency"
	},
	{
		key: "todayRevenue",
		title: "Doanh thu hôm nay",
		description: "Tổng tiền đã thu trong ngày",
		icon: Banknote,
		format: "currency"
	}
];
