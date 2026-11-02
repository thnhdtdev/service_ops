import { CalendarCheck } from "lucide-react";

import type { PortalShift } from "@/features/staff-portal/types";
import {
	formatDayMonth,
	formatShiftTime,
	getWeekdayLabel
} from "@/features/schedules/utils/schedule-dates";

type MyShiftsListProps = {
	shifts: PortalShift[];
};

export function MyShiftsList({ shifts }: MyShiftsListProps) {
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

			{shifts.length > 0 ? (
				<ul className="divide-border divide-y">
					{shifts.map((shift, index) => (
						<li
							key={index}
							className="flex items-center justify-between gap-3 px-4 py-3"
						>
							<div>
								<p className="text-sm font-semibold">
									{getWeekdayLabel(shift.shift_date)}
								</p>
								<p className="text-muted-foreground font-mono text-xs tabular-nums">
									{formatDayMonth(shift.shift_date)}
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm font-medium">{shift.name}</p>
								<p className="text-muted-foreground font-mono text-xs tabular-nums">
									{formatShiftTime(shift.start_time)}–
									{formatShiftTime(shift.end_time)}
								</p>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted-foreground px-4 py-6 text-center text-sm">
					Chưa có lịch làm nào được công bố.
				</p>
			)}
		</section>
	);
}
