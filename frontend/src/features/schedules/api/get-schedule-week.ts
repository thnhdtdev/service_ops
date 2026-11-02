import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import type { ScheduleWeekDetail } from "@/features/schedules/types";
import { apiFetch } from "@/lib/api/client";

export async function getScheduleWeek(id: string): Promise<ScheduleWeekDetail> {
	const res = await apiFetch(`/api/schedule-weeks/${id}`);

	if (!res.ok) {
		if (res.status === 404 || res.status === 400) {
			throw new Error("Không tìm thấy tuần này.");
		}

		throw new Error(await readErrorMessage(res, "Không thể tải lịch tuần."));
	}

	return (await res.json()) as ScheduleWeekDetail;
}
