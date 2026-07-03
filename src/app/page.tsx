import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PERIODS } from "@/constants/periods";

export default async function DashboardPage() {
	const dashboardStats = await getDashboardStats();

	return (
		<DashboardShell>
			<div className="space-y-6">
				<div className="flex items-center justify-end">
					<Select defaultValue="today">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Chọn thời gian" />
						</SelectTrigger>
						<SelectContent>
							{PERIODS.map((period) => (
								<SelectItem key={period.value} value={period.value}>
									{period.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<DashboardStats stats={dashboardStats} />

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<div className="bg-card text-card-foreground flex h-[300px] items-center justify-center rounded-xl border p-6 shadow">
							Biểu đồ Revenue Growth
						</div>
					</div>
					<div>
						<div className="bg-card text-card-foreground flex h-[300px] items-center justify-center rounded-xl border p-6 shadow">
							Biểu đồ Service Distribution
						</div>
					</div>
				</div>
			</div>
		</DashboardShell>
	);
}
