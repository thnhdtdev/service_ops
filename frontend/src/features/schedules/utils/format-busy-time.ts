import { WEEKDAY_LABEL, type Weekday } from "@/constants/weekdays";
import type { BusyTime } from "@/features/schedules/types";
import { formatDayMonth, formatShiftTime } from "@/features/schedules/utils/schedule-dates";

// "Thứ 3 hằng tuần, 07:00–12:00 · Đi học" or "12/11, cả ngày"
export function formatBusyTime(busyTime: BusyTime) {
	const day = busyTime.repeat_weekly
		? `${WEEKDAY_LABEL[busyTime.weekday as Weekday]} hằng tuần`
		: formatDayMonth(busyTime.busy_date as string);

	const isWholeDay =
		formatShiftTime(busyTime.start_time) === "00:00" &&
		formatShiftTime(busyTime.end_time) === "24:00";

	const time = isWholeDay
		? "cả ngày"
		: `${formatShiftTime(busyTime.start_time)}–${formatShiftTime(busyTime.end_time)}`;

	return busyTime.note ? `${day}, ${time} · ${busyTime.note}` : `${day}, ${time}`;
}
