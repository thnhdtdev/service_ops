import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import type { ScheduleWeek } from "@/features/schedules/types";
import { apiFetch } from "@/lib/api/client";

type ScheduleWeeksResponse = {
	schedule_weeks: ScheduleWeek[];
};

export async function getScheduleWeeks(): Promise<ScheduleWeek[]> {
	const res = await apiFetch("/api/schedule-weeks");

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể tải danh sách tuần."));
	}

	const data = (await res.json()) as ScheduleWeeksResponse;
	return data.schedule_weeks;
}
