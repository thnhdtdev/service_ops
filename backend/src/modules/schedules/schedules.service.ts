import { createUserSupabase } from "../../lib/supabase.js";

import type {
	CreateScheduleWeekInput,
	CreateShiftInput,
	UpdateScheduleWeekInput
} from "./schedules.schema.js";
import {
	addDaysToDate,
	buildShiftAvailability,
	findOverlappingBusyTimes
} from "./schedules.utils.js";

// Postgres error code for a unique constraint violation.
const UNIQUE_VIOLATION = "23505";

const SCHEDULE_WEEK_COLUMNS = `
	id,
	week_start,
	status,
	availability_deadline,
	published_at,
	created_at,
	updated_at
`;

const SHIFT_COLUMNS = `
	id,
	week_id,
	shift_date,
	name,
	start_time,
	end_time
`;

const BUSY_TIME_COLUMNS = `
	staff_member_id,
	repeat_weekly,
	busy_date,
	weekday,
	start_time,
	end_time,
	note
`;

export async function getScheduleWeeks(accessToken: string) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("schedule_weeks")
		.select(SCHEDULE_WEEK_COLUMNS)
		.order("week_start", { ascending: false })
		.limit(52);

	if (error) {
		throw error;
	}

	return data ?? [];
}

// Creates the week and copies active shift templates into it (one RPC,
// one transaction).
export async function createScheduleWeek(
	accessToken: string,
	input: CreateScheduleWeekInput
) {
	const supabase = createUserSupabase(accessToken);

	const { data: weekId, error } = await supabase.rpc(
		"create_schedule_week",
		{
			p_week_start: input.week_start,
			p_availability_deadline: input.availability_deadline
		}
	);

	if (error) {
		// The week already exists, or another week is still open.
		if (error.code === UNIQUE_VIOLATION) {
			return { status: "conflict" as const };
		}

		throw error;
	}

	const { data: week, error: weekError } = await supabase
		.from("schedule_weeks")
		.select(SCHEDULE_WEEK_COLUMNS)
		.eq("id", weekId)
		.single();

	if (weekError) {
		throw weekError;
	}

	return { status: "ok" as const, week };
}

// Week + every shift with who is assigned, free or busy.
export async function getScheduleWeekDetail(
	accessToken: string,
	id: string
) {
	const supabase = createUserSupabase(accessToken);

	const { data: week, error: weekError } = await supabase
		.from("schedule_weeks")
		.select(SCHEDULE_WEEK_COLUMNS)
		.eq("id", id)
		.maybeSingle();

	if (weekError) {
		throw weekError;
	}

	if (!week) {
		return null;
	}

	const weekEnd = addDaysToDate(week.week_start, 6);

	// These three queries do not depend on each other, so run them together.
	const [shiftsResult, staffResult, busyResult] = await Promise.all([
		supabase
			.from("shifts")
			.select(`
				id,
				shift_date,
				name,
				start_time,
				end_time,
				shift_assignments ( staff_member_id )
			`)
			.eq("week_id", id)
			.order("shift_date", { ascending: true })
			.order("start_time", { ascending: true }),

		supabase
			.from("staff_members")
			.select("id, full_name, is_active")
			.order("full_name", { ascending: true }),

		// Weekly busy times + one-off busy times inside this week.
		supabase
			.from("staff_busy_times")
			.select(BUSY_TIME_COLUMNS)
			.or(
				`repeat_weekly.eq.true,and(busy_date.gte.${week.week_start},busy_date.lte.${weekEnd})`
			)
	]);

	if (shiftsResult.error) {
		throw shiftsResult.error;
	}

	if (staffResult.error) {
		throw staffResult.error;
	}

	if (busyResult.error) {
		throw busyResult.error;
	}

	return {
		week,
		shifts: buildShiftAvailability(
			shiftsResult.data ?? [],
			staffResult.data ?? [],
			busyResult.data ?? []
		)
	};
}

export async function updateScheduleWeek(
	accessToken: string,
	id: string,
	input: UpdateScheduleWeekInput
) {
	const supabase = createUserSupabase(accessToken);
	const now = new Date().toISOString();

	const changes: Record<string, unknown> = {
		updated_at: now
	};

	if (input.availability_deadline) {
		changes.availability_deadline = input.availability_deadline;
	}

	if (input.status) {
		changes.status = input.status;
		changes.published_at = input.status === "published" ? now : null;
	}

	const { data, error } = await supabase
		.from("schedule_weeks")
		.update(changes)
		.eq("id", id)
		.select(SCHEDULE_WEEK_COLUMNS)
		.maybeSingle();

	if (error) {
		// Re-opening a week while another week is open.
		if (error.code === UNIQUE_VIOLATION) {
			return { status: "conflict" as const };
		}

		throw error;
	}

	if (!data) {
		return { status: "not_found" as const };
	}

	return { status: "ok" as const, week: data };
}

export async function createShift(
	accessToken: string,
	weekId: string,
	input: CreateShiftInput
) {
	const supabase = createUserSupabase(accessToken);

	const { data: week, error: weekError } = await supabase
		.from("schedule_weeks")
		.select("week_start")
		.eq("id", weekId)
		.maybeSingle();

	if (weekError) {
		throw weekError;
	}

	if (!week) {
		return { status: "not_found" as const };
	}

	// "YYYY-MM-DD" strings compare correctly as text.
	const weekEnd = addDaysToDate(week.week_start, 6);

	if (input.shift_date < week.week_start || input.shift_date > weekEnd) {
		return { status: "invalid_date" as const };
	}

	const { data: shift, error } = await supabase
		.from("shifts")
		.insert({
			week_id: weekId,
			shift_date: input.shift_date,
			name: input.name,
			start_time: input.start_time,
			end_time: input.end_time
		})
		.select(SHIFT_COLUMNS)
		.single();

	if (error) {
		throw error;
	}

	return { status: "ok" as const, shift };
}

export async function deleteShift(
	accessToken: string,
	id: string
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("shifts")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}

// Assigns even when the staff member is busy; the busy times that
// overlap the shift are returned as warnings.
export async function createShiftAssignment(
	accessToken: string,
	shiftId: string,
	staffMemberId: string
) {
	const supabase = createUserSupabase(accessToken);

	const [shiftResult, staffResult] = await Promise.all([
		supabase
			.from("shifts")
			.select("shift_date, start_time, end_time")
			.eq("id", shiftId)
			.maybeSingle(),

		supabase
			.from("staff_members")
			.select("is_active")
			.eq("id", staffMemberId)
			.maybeSingle()
	]);

	if (shiftResult.error) {
		throw shiftResult.error;
	}

	if (staffResult.error) {
		throw staffResult.error;
	}

	const shift = shiftResult.data;

	if (!shift) {
		return { status: "shift_not_found" as const };
	}

	if (!staffResult.data?.is_active) {
		return { status: "staff_not_found" as const };
	}

	const { error: insertError } = await supabase
		.from("shift_assignments")
		.insert({
			shift_id: shiftId,
			staff_member_id: staffMemberId
		});

	if (insertError) {
		if (insertError.code === UNIQUE_VIOLATION) {
			return { status: "already_assigned" as const };
		}

		throw insertError;
	}

	const { data: busyTimes, error: busyError } = await supabase
		.from("staff_busy_times")
		.select(BUSY_TIME_COLUMNS)
		.eq("staff_member_id", staffMemberId)
		.or(`repeat_weekly.eq.true,busy_date.eq.${shift.shift_date}`);

	if (busyError) {
		throw busyError;
	}

	return {
		status: "ok" as const,
		warnings: findOverlappingBusyTimes(shift, busyTimes ?? [])
	};
}

export async function deleteShiftAssignment(
	accessToken: string,
	shiftId: string,
	staffMemberId: string
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("shift_assignments")
		.delete()
		.eq("shift_id", shiftId)
		.eq("staff_member_id", staffMemberId)
		.select("shift_id")
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}
