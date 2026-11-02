import { readStaffPortalError } from "@/features/staff-portal/api/read-staff-portal-error";
import { staffPortalFetch } from "@/lib/api/public";

export type BusyTimePayload =
	| {
			repeat_weekly: true;
			weekday: number;
			start_time: string;
			end_time: string;
			note: string | null;
	  }
	| {
			repeat_weekly: false;
			busy_date: string;
			start_time: string;
			end_time: string;
			note: string | null;
	  };

// Replaces all weekly busy times and the busy days of the open week.
export async function saveBusyTimes(token: string, busyTimes: BusyTimePayload[]) {
	const res = await staffPortalFetch("/api/staff-portal/busy-times", token, {
		method: "PUT",
		body: JSON.stringify({
			busy_times: busyTimes
		})
	});

	if (!res.ok) {
		throw new Error(
			await readStaffPortalError(res, "Không thể lưu lịch bận. Vui lòng thử lại.")
		);
	}
}
