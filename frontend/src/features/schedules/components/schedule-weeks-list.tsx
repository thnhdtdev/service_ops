"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PATHS } from "@/constants/routes";
import { SCHEDULE_WEEK_STATUS_LABEL } from "@/constants/schedule-week-status";
import { CreateScheduleWeekDialog } from "@/features/schedules/components/create-schedule-week-dialog";
import { useScheduleWeeks } from "@/features/schedules/hooks/use-schedule-weeks";
import { formatWeekRange } from "@/features/schedules/utils/schedule-dates";
import { formatTime } from "@/lib/format";

export function ScheduleWeeksList() {
	const { scheduleWeeks, isLoading, error } = useScheduleWeeks();

	return (
		<section
			aria-labelledby="schedule-weeks-title"
			className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
		>
			<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2
						id="schedule-weeks-title"
						className="text-card-foreground text-lg font-semibold tracking-tight"
					>
						Lịch theo tuần
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Mỗi lúc chỉ có một tuần mở nhận lịch bận. Công bố tuần đó trước khi tạo tuần
						tiếp theo.
					</p>
				</div>
				<CreateScheduleWeekDialog />
			</header>

			{isLoading ? (
				<p role="status" className="text-muted-foreground px-5 py-8 text-center text-sm">
					Đang tải danh sách tuần...
				</p>
			) : error ? (
				<p role="alert" className="text-destructive px-5 py-8 text-center text-sm">
					{error}
				</p>
			) : scheduleWeeks.length > 0 ? (
				<div className="divide-border divide-y">
					{scheduleWeeks.map((week) => (
						<Link
							key={week.id}
							href={`${PATHS.SCHEDULES}/${week.id}`}
							className="hover:bg-muted/35 focus-visible:bg-muted/35 flex items-center gap-3 px-5 py-4 transition-colors outline-none"
						>
							<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
								<CalendarDays
									aria-hidden="true"
									strokeWidth={1.8}
									className="size-4"
								/>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-sm font-semibold tabular-nums">
									Tuần {formatWeekRange(week.week_start)}
								</h3>
								<p className="text-muted-foreground mt-0.5 text-xs">
									Hạn chót báo lịch bận: {formatTime(week.availability_deadline)}
								</p>
							</div>
							<Badge
								variant="outline"
								className={
									week.status === "published"
										? "border-success/30 bg-success/10 text-success"
										: "border-warning/30 bg-warning/10 text-warning"
								}
							>
								{SCHEDULE_WEEK_STATUS_LABEL[week.status]}
							</Badge>
							<ChevronRight
								aria-hidden="true"
								className="text-muted-foreground size-4 shrink-0"
							/>
						</Link>
					))}
				</div>
			) : (
				<p className="text-muted-foreground px-5 py-8 text-center text-sm">
					Chưa có tuần nào. Hãy thêm ca mẫu rồi tạo tuần mới.
				</p>
			)}
		</section>
	);
}
