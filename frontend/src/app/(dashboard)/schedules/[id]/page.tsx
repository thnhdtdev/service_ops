import { ScheduleWeekBoard } from "@/features/schedules/components/schedule-week-board";
import { requireAdminPage } from "@/lib/auth/current-user";

type ScheduleWeekPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function ScheduleWeekPage({ params }: ScheduleWeekPageProps) {
	await requireAdminPage();

	const { id } = await params;

	return <ScheduleWeekBoard weekId={id} />;
}
