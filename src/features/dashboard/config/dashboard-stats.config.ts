import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock3,
  WalletCards,
  type LucideIcon,
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
    icon: ClipboardList,
  },
  {
    key: "processingOrders",
    title: "Đơn đang xử lý",
    description: "Các đơn hiện đang được thực hiện",
    icon: Clock3,
  },
  {
    key: "completedOrders",
    title: "Đơn đã xong",
    description: "Các đơn đã hoàn tất và sẵn sàng trả khách",
    icon: CheckCircle2,
  },
  {
    key: "unpaidOrders",
    title: "Đơn chưa thanh toán",
    description: "Các đơn chưa thanh toán hoặc chưa thanh toán đủ",
    icon: WalletCards,
  },
  {
    key: "todayRevenue",
    title: "Doanh thu hôm nay",
    description: "Tổng doanh thu đã thanh toán trong ngày",
    icon: Banknote,
    format: "currency",
  },
];