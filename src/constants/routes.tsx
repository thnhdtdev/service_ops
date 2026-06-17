import {
  ClipboardList,
  Gauge,
  Package,
  Users,
} from "lucide-react";

export const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  ORDERS: "/orders",
  CREATE_ORDER: "/orders/new",
  CUSTOMERS: "/customers",
  SERVICES: "/services",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

export type PathKey = keyof typeof PATHS;
export type PathValue = (typeof PATHS)[PathKey];

export const APP_ROUTES = [
  {
    title: "Dashboard",
    href: PATHS.HOME,
    icon: Gauge,
  },
  {
    title: "Orders",
    href: PATHS.ORDERS,
    icon: ClipboardList,
  },
  {
    title: "Customers",
    href: PATHS.CUSTOMERS,
    icon: Users,
  },
  {
    title: "Services",
    href: PATHS.SERVICES,
    icon: Package,
  },
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