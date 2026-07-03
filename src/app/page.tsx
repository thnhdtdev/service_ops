import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardPage() {
    const dashboardStats = await getDashboardStats();

    return (
        <DashboardShell>
            <div className="space-y-6">
                <DashboardStats stats={dashboardStats} />
            </div>
        </DashboardShell>
    );
}
