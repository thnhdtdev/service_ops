import type { ScheduleWeekStatus } from "@/constants/schedule-week-status";

export type ShiftTemplate = {
	id: string;
	name: string;
	start_time: string;
	end_time: string;
	sort_order: number;
	is_active: boolean;
	created_at: string;
};

export type ScheduleWeek = {
	id: string;
	// Always a Monday, "YYYY-MM-DD"
	week_start: string;
	status: ScheduleWeekStatus;
	availability_deadline: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
};

export type BusyTime = {
	staff_member_id: string;
	repeat_weekly: boolean;
	busy_date: string | null;
	weekday: number | null;
	start_time: string;
	end_time: string;
	note: string | null;
};

// One shift with who is assigned, free or busy (computed by the backend).
export type ShiftAvailability = {
	id: string;
	shift_date: string;
	name: string;
	start_time: string;
	end_time: string;
	assigned: {
		staff_member_id: string;
		full_name: string;
		is_active: boolean;
		// Busy times that overlap this shift (empty = no conflict)
		busy_times: BusyTime[];
	}[];
	available: {
		staff_member_id: string;
		full_name: string;
	}[];
	busy: {
		staff_member_id: string;
		full_name: string;
		busy_times: BusyTime[];
	}[];
};

export type ScheduleWeekDetail = {
	week: ScheduleWeek;
	shifts: ShiftAvailability[];
};
