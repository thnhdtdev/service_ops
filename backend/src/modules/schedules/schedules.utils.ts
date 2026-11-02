// Pure date/time helpers and availability calculation for schedules.
// Dates are "YYYY-MM-DD" strings and times are "HH:MM" or "HH:MM:SS"
// strings, the same format Postgres returns for date/time columns.

export type BusyTime = {
	staff_member_id: string;
	repeat_weekly: boolean;
	busy_date: string | null;
	weekday: number | null;
	start_time: string;
	end_time: string;
	note: string | null;
};

export type ShiftTime = {
	shift_date: string;
	start_time: string;
	end_time: string;
};

export type ShiftWithAssignments = ShiftTime & {
	id: string;
	name: string;
	shift_assignments: {
		staff_member_id: string;
	}[];
};

export type StaffMemberSummary = {
	id: string;
	full_name: string;
	is_active: boolean;
};

// 1 = Monday ... 7 = Sunday (same as Postgres isodow).
export function getIsoWeekday(date: string): number {
	const day = new Date(`${date}T00:00:00Z`).getUTCDay();

	return day === 0 ? 7 : day;
}

export function addDaysToDate(date: string, days: number): string {
	const result = new Date(`${date}T00:00:00Z`);

	result.setUTCDate(result.getUTCDate() + days);

	return result.toISOString().slice(0, 10);
}

// "07:30" or "07:30:00" -> 450
export function timeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":");

	return Number(hours) * 60 + Number(minutes);
}

// Busy times on the same day as the shift whose time range overlaps it.
// Ranges that only touch (busy until 12:00, shift from 12:00) do not overlap.
export function findOverlappingBusyTimes(
	shift: ShiftTime,
	busyTimes: BusyTime[]
): BusyTime[] {
	const shiftStart = timeToMinutes(shift.start_time);
	const shiftEnd = timeToMinutes(shift.end_time);
	const shiftWeekday = getIsoWeekday(shift.shift_date);

	return busyTimes.filter((busyTime) => {
		const isSameDay = busyTime.repeat_weekly
			? busyTime.weekday === shiftWeekday
			: busyTime.busy_date === shift.shift_date;

		if (!isSameDay) {
			return false;
		}

		return (
			timeToMinutes(busyTime.start_time) < shiftEnd &&
			shiftStart < timeToMinutes(busyTime.end_time)
		);
	});
}

// For each shift: who is assigned (with busy times that conflict),
// and which other active staff members are free or busy.
export function buildShiftAvailability(
	shifts: ShiftWithAssignments[],
	staffMembers: StaffMemberSummary[],
	busyTimes: BusyTime[]
) {
	return shifts.map((shift) => {
		const shiftBusyTimes = findOverlappingBusyTimes(shift, busyTimes);

		const assignedIds = new Set(
			shift.shift_assignments.map((assignment) => assignment.staff_member_id)
		);

		function getBusyTimesOf(staffMemberId: string) {
			return shiftBusyTimes.filter(
				(busyTime) => busyTime.staff_member_id === staffMemberId
			);
		}

		const assigned = staffMembers
			.filter((member) => assignedIds.has(member.id))
			.map((member) => ({
				staff_member_id: member.id,
				full_name: member.full_name,
				is_active: member.is_active,
				busy_times: getBusyTimesOf(member.id)
			}));

		const notAssigned = staffMembers.filter(
			(member) => member.is_active && !assignedIds.has(member.id)
		);

		const available = notAssigned
			.filter((member) => getBusyTimesOf(member.id).length === 0)
			.map((member) => ({
				staff_member_id: member.id,
				full_name: member.full_name
			}));

		const busy = notAssigned
			.filter((member) => getBusyTimesOf(member.id).length > 0)
			.map((member) => ({
				staff_member_id: member.id,
				full_name: member.full_name,
				busy_times: getBusyTimesOf(member.id)
			}));

		return {
			id: shift.id,
			shift_date: shift.shift_date,
			name: shift.name,
			start_time: shift.start_time,
			end_time: shift.end_time,
			assigned,
			available,
			busy
		};
	});
}
