import { ScheduleWeeksList } from "@/features/schedules/components/schedule-weeks-list";
import { ShiftTemplatesList } from "@/features/schedules/components/shift-templates-list";

export default function SchedulesPage() {
	return (
		<div className="space-y-6">
			<ScheduleWeeksList />
			<ShiftTemplatesList />
		</div>
	);
}
