export const SCHEDULE_WEEK_STATUS_LABEL = {
	open: "Đang nhận lịch bận",
	published: "Đã công bố"
} as const;

export type ScheduleWeekStatus = keyof typeof SCHEDULE_WEEK_STATUS_LABEL;
