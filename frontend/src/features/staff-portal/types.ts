export type PortalShift = {
	shift_date: string;
	name: string;
	start_time: string;
	end_time: string;
};

export type PortalBusyTime = {
	repeat_weekly: boolean;
	busy_date: string | null;
	weekday: number | null;
	start_time: string;
	end_time: string;
	note: string | null;
};

// Data for one staff member only (built by the staff_portal_get function).
export type StaffPortalData = {
	staff: {
		full_name: string;
	};
	// The week that is collecting busy times, or null.
	open_week: {
		week_start: string;
		availability_deadline: string;
		can_edit: boolean;
		shifts: PortalShift[];
	} | null;
	busy_times: PortalBusyTime[];
	// This staff member's shifts in published weeks, from today on.
	my_shifts: PortalShift[];
};
