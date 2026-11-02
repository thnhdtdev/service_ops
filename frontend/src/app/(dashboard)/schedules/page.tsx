import { ScheduleWeeksList } from "@/features/schedules/components/schedule-weeks-list";
import { ShiftTemplatesList } from "@/features/schedules/components/shift-templates-list";
import { requireAdminPage } from "@/lib/auth/current-user";

export default async function SchedulesPage() {
	await requireAdminPage();

	return (
		<div className="space-y-6">
			<ScheduleWeeksList />
			<ShiftTemplatesList />
		</div>
	);
}
