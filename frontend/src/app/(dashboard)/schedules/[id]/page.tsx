import { ScheduleWeekBoard } from "@/features/schedules/components/schedule-week-board";

type ScheduleWeekPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function ScheduleWeekPage({ params }: ScheduleWeekPageProps) {
	const { id } = await params;

	return <ScheduleWeekBoard weekId={id} />;
}
