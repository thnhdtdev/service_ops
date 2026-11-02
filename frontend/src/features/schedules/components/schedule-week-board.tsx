"use client";

import {
	ArrowLeft,
	CircleAlert,
	CircleOff,
	LoaderCircle,
	Megaphone,
	RotateCcw,
	TriangleAlert,
	Undo2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { PATHS } from "@/constants/routes";
import { SCHEDULE_WEEK_STATUS_LABEL } from "@/constants/schedule-week-status";
import { updateScheduleWeek } from "@/features/schedules/api/update-schedule-week";
import { AddShiftDialog } from "@/features/schedules/components/add-shift-dialog";
import { ScheduleDeadlineDialog } from "@/features/schedules/components/schedule-deadline-dialog";
import { ShiftCard } from "@/features/schedules/components/shift-card";
import { useScheduleWeek } from "@/features/schedules/hooks/use-schedule-week";
import {
	addDays,
	formatDayMonth,
	formatWeekRange,
	getWeekdayLabel
} from "@/features/schedules/utils/schedule-dates";
import { formatTime } from "@/lib/format";

type ScheduleWeekBoardProps = {
	weekId: string;
};

export function ScheduleWeekBoard({ weekId }: ScheduleWeekBoardProps) {
	const { detail, isLoading, error, refetch } = useScheduleWeek(weekId);
	const [actionError, setActionError] = useState("");
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const { showSuccessToast } = useToast();

	if (isLoading) {
		return (
			<p role="status" className="text-muted-foreground py-16 text-center text-sm">
				Đang tải lịch tuần...
			</p>
		);
	}

	if (error || !detail) {
		return (
			<section
				role="alert"
				className="border-destructive/30 bg-destructive/5 rounded-2xl border px-5 py-10 text-center shadow-sm"
			>
				<div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-2xl">
					<CircleOff aria-hidden="true" strokeWidth={1.8} className="size-5" />
				</div>
				<h2 className="mt-4 text-lg font-semibold">Không thể tải lịch tuần</h2>
				<p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
					{error || "Đã xảy ra sự cố khi tải dữ liệu."}
				</p>
				<div className="mt-5 flex justify-center gap-2">
					<Button asChild variant="outline">
						<Link href={PATHS.SCHEDULES}>
							<ArrowLeft aria-hidden="true" data-icon="inline-start" />
							Về danh sách tuần
						</Link>
					</Button>
					<Button type="button" variant="outline" onClick={() => void refetch()}>
						<RotateCcw aria-hidden="true" data-icon="inline-start" />
						Thử tải lại
					</Button>
				</div>
			</section>
		);
	}

	const { week, shifts } = detail;
	const isPublished = week.status === "published";
	const isDeadlinePassed = new Date(week.availability_deadline) <= new Date();

	const days = Array.from({ length: 7 }, (_, index) => {
		const date = addDays(week.week_start, index);

		return {
			date,
			shifts: shifts.filter((shift) => shift.shift_date === date)
		};
	});

	const conflictCount = shifts.reduce(
		(count, shift) =>
			count + shift.assigned.filter((member) => member.busy_times.length > 0).length,
		0
	);

	async function handleChangeStatus() {
		const nextStatus = isPublished ? "open" : "published";
		const confirmed = window.confirm(
			nextStatus === "published"
				? "Công bố lịch tuần này? Nhân viên sẽ xem được ca làm qua link và không sửa được lịch bận nữa."
				: "Mở lại tuần này? Nhân viên sẽ không xem được lịch làm cho đến khi bạn công bố lại."
		);

		if (!confirmed) return;

		setIsChangingStatus(true);
		setActionError("");

		try {
			await updateScheduleWeek(week.id, { status: nextStatus });
			await refetch();
			showSuccessToast({
				title: nextStatus === "published" ? "Đã công bố lịch" : "Đã mở lại tuần",
				description: `Tuần ${formatWeekRange(week.week_start)}`
			});
		} catch (error) {
			setActionError(
				error instanceof Error ? error.message : "Không thể đổi trạng thái tuần lúc này."
			);
		} finally {
			setIsChangingStatus(false);
		}
	}

	return (
		<div className="space-y-6">
			<section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="min-w-0">
					<Link
						href={PATHS.SCHEDULES}
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
					>
						<ArrowLeft aria-hidden="true" className="size-3.5" />
						Danh sách tuần
					</Link>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<h2 className="text-lg font-semibold tracking-tight tabular-nums">
							Tuần {formatWeekRange(week.week_start)}
						</h2>
						<Badge
							variant="outline"
							className={
								isPublished
									? "border-success/30 bg-success/10 text-success"
									: "border-warning/30 bg-warning/10 text-warning"
							}
						>
							{SCHEDULE_WEEK_STATUS_LABEL[week.status]}
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-sm">
						Hạn chót báo lịch bận: {formatTime(week.availability_deadline)}
						{isDeadlinePassed ? " (đã qua)" : ""}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<ScheduleDeadlineDialog week={week} onSaved={refetch} />
					<Button
						type="button"
						variant={isPublished ? "outline" : "default"}
						className="h-9"
						onClick={handleChangeStatus}
						disabled={isChangingStatus}
					>
						{isChangingStatus ? (
							<LoaderCircle
								aria-hidden="true"
								className="animate-spin motion-reduce:animate-none"
							/>
						) : isPublished ? (
							<Undo2 aria-hidden="true" data-icon="inline-start" />
						) : (
							<Megaphone aria-hidden="true" data-icon="inline-start" />
						)}
						{isPublished ? "Mở lại tuần" : "Công bố lịch"}
					</Button>
				</div>
			</section>

			{actionError ? (
				<div
					role="alert"
					className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
				>
					<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
					<p>{actionError}</p>
				</div>
			) : null}

			{conflictCount > 0 ? (
				<div className="border-warning/30 bg-warning/10 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5">
					<TriangleAlert
						aria-hidden="true"
						className="text-warning mt-0.5 size-4 shrink-0"
					/>
					<p>
						Có <strong>{conflictCount}</strong> lượt xếp ca trùng giờ bận của nhân viên.
						Các ca này được đánh dấu màu vàng.
					</p>
				</div>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
				{days.map((day) => (
					<section
						key={day.date}
						aria-label={`${getWeekdayLabel(day.date)}, ${formatDayMonth(day.date)}`}
						className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-3 shadow-sm"
					>
						<h3 className="flex items-baseline justify-between px-1">
							<span className="text-sm font-semibold">
								{getWeekdayLabel(day.date)}
							</span>
							<span className="text-muted-foreground font-mono text-xs tabular-nums">
								{formatDayMonth(day.date)}
							</span>
						</h3>

						{day.shifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								onChanged={refetch}
								onError={setActionError}
							/>
						))}

						{day.shifts.length === 0 ? (
							<p className="text-muted-foreground px-1 text-xs">Không có ca.</p>
						) : null}

						<AddShiftDialog weekId={week.id} shiftDate={day.date} onSaved={refetch} />
					</section>
				))}
			</div>
		</div>
	);
}
