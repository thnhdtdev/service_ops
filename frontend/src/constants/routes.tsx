import {
	CalendarDays,
	ClipboardList,
	Gauge,
	Package,
	Settings,
	UserCog,
	Users
} from "lucide-react";

export const PATHS = {
	HOME: "/",
	DASHBOARD: "/dashboard",
	LOGIN: "/login",
	ORDERS: "/orders",
	CREATE_ORDER: "/orders/new",
	CUSTOMERS: "/customers",
	SERVICES: "/services",
	STAFF: "/staff",
	SCHEDULES: "/schedules",
	// Public staff link page: /s/<token> (no login, excluded from proxy.ts)
	STAFF_PORTAL: "/s",
	REPORTS: "/reports",
	SETTINGS: "/settings"
} as const;

export type PathKey = keyof typeof PATHS;
export type PathValue = (typeof PATHS)[PathKey];

// adminOnly: hidden from the staff account in the sidebar. The backend and
// RLS still block those pages, this only hides links that would not work.
export const APP_ROUTES = [
	{
		title: "Tổng quan",
		href: PATHS.HOME,
		icon: Gauge,
		adminOnly: false
	},
	{
		title: "Đơn hàng",
		href: PATHS.ORDERS,
		icon: ClipboardList,
		adminOnly: false
	},
	{
		title: "Khách hàng",
		href: PATHS.CUSTOMERS,
		icon: Users,
		adminOnly: false
	},
	{
		title: "Dịch vụ",
		href: PATHS.SERVICES,
		icon: Package,
		adminOnly: false
	},
	{
		title: "Nhân viên",
		href: PATHS.STAFF,
		icon: UserCog,
		adminOnly: true
	},
	{
		title: "Lịch làm",
		href: PATHS.SCHEDULES,
		icon: CalendarDays,
		adminOnly: true
	},
	{
		title: "Cài đặt",
		href: PATHS.SETTINGS,
		icon: Settings,
		adminOnly: true
	}
	// {
	//   title: "Reports",
	//   href: PATHS.REPORTS,
	//   icon: BarChart3,
	// },
] as const;
