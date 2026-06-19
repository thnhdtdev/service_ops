import type { OrderStatus } from "@/constants/order-status";
import type { PaymentStatus } from "@/constants/payment-status";

export type DashboardStats = {
  ordersToday: number;
  processingOrders: number;
  completedOrders: number;
  unpaidOrders: number;
  todayRevenue: number;
};

export type AttentionOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  serviceSummary: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  dueAt: string | null;
};