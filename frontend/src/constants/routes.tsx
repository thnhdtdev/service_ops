import { ClipboardList, Gauge, Package, UserCog, Users } from "lucide-react";

export const PATHS = {
	HOME: "/",
	DASHBOARD: "/dashboard",
	LOGIN: "/login",
	ORDERS: "/orders",
	CREATE_ORDER: "/orders/new",
	CUSTOMERS: "/customers",
	SERVICES: "/services",
	STAFF: "/staff",
	// Public staff link page: /s/<token> (no login, excluded from proxy.ts)
	STAFF_PORTAL: "/s",
	REPORTS: "/reports",
	SETTINGS: "/settings"
} as const;

export type PathKey = keyof typeof PATHS;
export type PathValue = (typeof PATHS)[PathKey];

export const APP_ROUTES = [
	{
		title: "Tổng quan",
		href: PATHS.HOME,
		icon: Gauge
	},
	{
		title: "Đơn hàng",
		href: PATHS.ORDERS,
		icon: ClipboardList
	},
	{
		title: "Khách hàng",
		href: PATHS.CUSTOMERS,
		icon: Users
	},
	{
		title: "Dịch vụ",
		href: PATHS.SERVICES,
		icon: Package
	},
	{
		title: "Nhân viên",
		href: PATHS.STAFF,
		icon: UserCog
	}
	// {
	//   title: "Reports",
	//   href: PATHS.REPORTS,
	//   icon: BarChart3,
	// },
	// {
	//   title: "Settings",
	//   href: PATHS.SETTINGS,
	//   icon: Settings,
	// },
] as const;
