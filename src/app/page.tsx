import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AttentionOrdersTable } from "@/features/dashboard/components/attention-orders-table";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import {
  attentionOrdersMock,
  dashboardStatsMock,
} from "@/features/dashboard/services/dashboard.mock";

export default function DashboardPage() {
  return (
        <DashboardShell>
          <div className="space-y-6">
            <DashboardStats stats={dashboardStatsMock} />
            <AttentionOrdersTable orders={attentionOrdersMock} />
          </div>
        </DashboardShell>
  );
}