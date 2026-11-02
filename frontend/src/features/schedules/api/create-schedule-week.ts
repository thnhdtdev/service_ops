import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import type { ScheduleWeek } from "@/features/schedules/types";
import { apiFetch } from "@/lib/api/client";

type CreateScheduleWeekInput = {
	week_start: string;
	// ISO timestamp
	availability_deadline: string;
};

type ScheduleWeekResponse = {
	schedule_week: ScheduleWeek;
};

// Creates the week and copies the active shift templates into it.
export async function createScheduleWeek(input: CreateScheduleWeekInput): Promise<ScheduleWeek> {
	const res = await apiFetch("/api/schedule-weeks", {
		method: "POST",
		body: JSON.stringify(input)
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể tạo tuần mới."));
	}

	const data = (await res.json()) as ScheduleWeekResponse;
	return data.schedule_week;
}
