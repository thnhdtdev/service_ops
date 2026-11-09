import { Suspense } from "react";

import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
	RevenueChartSection,
	RevenueChartSkeleton
} from "@/features/dashboard/components/revenue-chart-section";
import {
	ServiceMixChartSkeleton,
	ServiceMixSection
} from "@/features/dashboard/components/service-mix-section";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function DashboardPage() {
	const [currentUser, dashboardStats] = await Promise.all([
		getCurrentUser(),
		getDashboardStats()
	]);
	// No user: DashboardShell redirects to /login.
	const isAdmin = currentUser?.isAdmin === true;

	return (
		<DashboardShell>
			<div className="space-y-6">
				<DashboardStats stats={dashboardStats} />

				{/* Revenue charts are admin-only (the backend also returns 403 to staff),
				    so they are not rendered, and not requested, for the staff account. */}
				{isAdmin ? (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2">
							<Suspense fallback={<RevenueChartSkeleton />}>
								<RevenueChartSection />
							</Suspense>
						</div>
						<Suspense fallback={<ServiceMixChartSkeleton />}>
							<ServiceMixSection />
						</Suspense>
					</div>
				) : null}
			</div>
		</DashboardShell>
	);
}
