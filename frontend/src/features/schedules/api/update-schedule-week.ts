import type { ScheduleWeekStatus } from "@/constants/schedule-week-status";
import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

type UpdateScheduleWeekInput = {
	// ISO timestamp
	availability_deadline?: string;
	status?: ScheduleWeekStatus;
};

export async function updateScheduleWeek(id: string, input: UpdateScheduleWeekInput) {
	const res = await apiFetch(`/api/schedule-weeks/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input)
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể cập nhật tuần."));
	}
}
