import { CalendarCheck } from "lucide-react";

import type { PortalShift } from "@/features/staff-portal/types";
import {
	addDays,
	formatDayMonth,
	formatShiftTime,
	formatWeekRange,
	getTodayDate,
	getWeekStart,
	getWeekdayLabel
} from "@/features/schedules/utils/schedule-dates";
import { cn } from "@/lib/utils";

type MyShiftsListProps = {
	shifts: PortalShift[];
};

type WeekOfShifts = {
	weekStart: string;
	days: {
		date: string;
		shifts: PortalShift[];
	}[];
};

// One entry per week that has shifts, each with all 7 days (Monday first).
// `shifts` is already sorted by date, so the weeks come out in order.
function groupShiftsByWeek(shifts: PortalShift[]): WeekOfShifts[] {
	const weekStarts = Array.from(new Set(shifts.map((shift) => getWeekStart(shift.shift_date))));

	return weekStarts.map((weekStart) => ({
		weekStart,
		days: Array.from({ length: 7 }, (_, index) => {
			const date = addDays(weekStart, index);

			return {
				date,
				shifts: shifts.filter((shift) => shift.shift_date === date)
			};
		})
	}));
}

export function MyShiftsList({ shifts }: MyShiftsListProps) {
	const weeks = groupShiftsByWeek(shifts);
	const today = getTodayDate();

	return (
		<section
			aria-labelledby="my-shifts-title"
			className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
		>
			<header className="border-border flex items-center gap-3 border-b px-4 py-3">
				<div className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-xl">
					<CalendarCheck aria-hidden="true" strokeWidth={1.8} className="size-4" />
				</div>
				<div>
					<h2 id="my-shifts-title" className="text-base font-semibold">
						Lịch làm của bạn
					</h2>
					<p className="text-muted-foreground text-xs">
						Các ca đã được công bố, từ hôm nay.
					</p>
				</div>
			</header>

			{weeks.length > 0 ? (
				<div className="space-y-5 p-4">
					{weeks.map((week) => (
						<div key={week.weekStart} className="space-y-2">
							<h3 className="text-sm font-semibold tabular-nums">
								Tuần {formatWeekRange(week.weekStart)}
							</h3>

							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
								{week.days.map((day) => {
									const isToday = day.date === today;
									// Shifts are only returned from today on, so an earlier
									// day is "past", not "day off".
									const isPast = day.date < today;

									return (
										<section
											key={day.date}
											aria-label={`${getWeekdayLabel(day.date)}, ${formatDayMonth(day.date)}`}
											aria-current={isToday ? "date" : undefined}
											className={cn(
												"flex min-h-24 flex-col gap-2 rounded-xl border p-2.5",
												isToday
													? "border-primary bg-primary/5"
													: "border-border bg-background",
												isPast && "opacity-60"
											)}
										>
											<div className="flex items-baseline justify-between gap-1">
												<span className="text-sm font-semibold">
													{getWeekdayLabel(day.date)}
												</span>
												<span className="text-muted-foreground font-mono text-xs tabular-nums">
													{formatDayMonth(day.date)}
												</span>
											</div>

											{isToday ? (
												<span className="text-primary text-xs font-medium">
													Hôm nay
												</span>
											) : null}

											{day.shifts.length > 0 ? (
												day.shifts.map((shift, index) => (
													<div
														key={index}
														className="border-success/30 bg-success/10 rounded-md border px-2 py-1.5"
													>
														<p className="text-xs font-semibold">
															{shift.name}
														</p>
														<p className="font-mono text-xs tabular-nums">
															{formatShiftTime(shift.start_time)}–
															{formatShiftTime(shift.end_time)}
														</p>
													</div>
												))
											) : (
												<p className="text-muted-foreground text-xs">
													{isPast ? "Đã qua" : "Nghỉ"}
												</p>
											)}
										</section>
									);
								})}
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-muted-foreground px-4 py-6 text-center text-sm">
					Chưa có lịch làm nào được công bố.
				</p>
			)}
		</section>
	);
}
