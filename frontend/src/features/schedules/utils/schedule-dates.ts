import { WEEKDAY_LABEL, type Weekday } from "@/constants/weekdays";

// Dates from the API are "YYYY-MM-DD" with no time zone. They are read as
// UTC midnight so the day never shifts with the browser's time zone.
function parseDate(date: string) {
	return new Date(`${date}T00:00:00Z`);
}

function padTwo(value: number) {
	return String(value).padStart(2, "0");
}

export function addDays(date: string, days: number): string {
	const result = parseDate(date);

	result.setUTCDate(result.getUTCDate() + days);

	return result.toISOString().slice(0, 10);
}

// 1 = Monday ... 7 = Sunday
export function getIsoWeekday(date: string): Weekday {
	const day = parseDate(date).getUTCDay();

	return (day === 0 ? 7 : day) as Weekday;
}

export function getWeekdayLabel(date: string) {
	return WEEKDAY_LABEL[getIsoWeekday(date)];
}

// "2026-11-09" -> "09/11"
export function formatDayMonth(date: string) {
	const value = parseDate(date);

	return `${padTwo(value.getUTCDate())}/${padTwo(value.getUTCMonth() + 1)}`;
}

// "2026-11-09" -> "09/11 – 15/11/2026"
export function formatWeekRange(weekStart: string) {
	const weekEnd = addDays(weekStart, 6);

	return `${formatDayMonth(weekStart)} – ${formatDayMonth(weekEnd)}/${weekEnd.slice(0, 4)}`;
}

// "07:00:00" -> "07:00"
export function formatShiftTime(time: string) {
	return time.slice(0, 5);
}

// Next Monday in the browser's local date, as "YYYY-MM-DD".
export function getNextMonday() {
	const date = new Date();
	const daysUntilMonday = (8 - date.getDay()) % 7 || 7;

	date.setDate(date.getDate() + daysUntilMonday);

	return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
}

// ISO timestamp -> value for <input type="datetime-local"> in local time.
export function toDateTimeLocalValue(isoDate: string) {
	const date = new Date(isoDate);

	return (
		`${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}` +
		`T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`
	);
}
