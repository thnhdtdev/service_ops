import type { BusyTimePayload } from "@/features/staff-portal/api/save-busy-times";
import type { PortalBusyTime } from "@/features/staff-portal/types";
import { formatShiftTime } from "@/features/schedules/utils/schedule-dates";

// One row of the busy time form.
export type BusyTimeRow = {
	// Only for React's `key`, never sent to the backend.
	key: number;
	repeat_weekly: boolean;
	// Used when repeat_weekly = false
	busy_date: string;
	// Used when repeat_weekly = true (1 = Monday ... 7 = Sunday)
	weekday: number;
	is_whole_day: boolean;
	start_time: string;
	end_time: string;
	note: string;
};

export const MAX_BUSY_TIME_ROWS = 50;

let lastRowKey = 0;

function nextRowKey() {
	lastRowKey += 1;

	return lastRowKey;
}

export function createEmptyBusyTimeRow(weekStart: string): BusyTimeRow {
	return {
		key: nextRowKey(),
		repeat_weekly: false,
		busy_date: weekStart,
		weekday: 1,
		is_whole_day: false,
		start_time: "08:00",
		end_time: "12:00",
		note: ""
	};
}

// API data -> form row
export function toBusyTimeRow(busyTime: PortalBusyTime, weekStart: string): BusyTimeRow {
	const startTime = formatShiftTime(busyTime.start_time);
	const endTime = formatShiftTime(busyTime.end_time);

	return {
		key: nextRowKey(),
		repeat_weekly: busyTime.repeat_weekly,
		busy_date: busyTime.busy_date ?? weekStart,
		weekday: busyTime.weekday ?? 1,
		is_whole_day: startTime === "00:00" && endTime === "24:00",
		start_time: startTime,
		end_time: endTime,
		note: busyTime.note ?? ""
	};
}

// Form row -> data sent to the backend
export function toBusyTimePayload(row: BusyTimeRow): BusyTimePayload {
	const startTime = row.is_whole_day ? "00:00" : row.start_time;
	const endTime = row.is_whole_day ? "24:00" : row.end_time;
	const note = row.note.trim() || null;

	if (row.repeat_weekly) {
		return {
			repeat_weekly: true,
			weekday: row.weekday,
			start_time: startTime,
			end_time: endTime,
			note
		};
	}

	return {
		repeat_weekly: false,
		busy_date: row.busy_date,
		start_time: startTime,
		end_time: endTime,
		note
	};
}

// Returns an error message per row key. Empty object = all rows are valid.
export function validateBusyTimeRows(rows: BusyTimeRow[]) {
	const errors: Record<number, string> = {};

	for (const row of rows) {
		if (!row.is_whole_day && !(row.end_time > row.start_time)) {
			errors[row.key] = "Giờ kết thúc phải sau giờ bắt đầu.";
		} else if (row.note.trim().length > 200) {
			errors[row.key] = "Ghi chú tối đa 200 ký tự.";
		}
	}

	return errors;
}
