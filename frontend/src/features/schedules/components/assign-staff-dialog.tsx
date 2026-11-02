"use client";

import { CircleAlert, CircleCheck, LoaderCircle, TriangleAlert, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { createShiftAssignment } from "@/features/schedules/api/create-shift-assignment";
import type { ShiftAvailability } from "@/features/schedules/types";
import { formatBusyTime } from "@/features/schedules/utils/format-busy-time";
import {
	formatDayMonth,
	formatShiftTime,
	getWeekdayLabel
} from "@/features/schedules/utils/schedule-dates";

type AssignStaffDialogProps = {
	shift: ShiftAvailability;
	onAssigned: () => void | Promise<void>;
};

export function AssignStaffDialog({ shift, onAssigned }: AssignStaffDialogProps) {
	const [open, setOpen] = useState(false);
	// Id of the staff member being assigned right now (shows a spinner).
	const [assigningId, setAssigningId] = useState<string | null>(null);
	const [error, setError] = useState("");

	function handleOpenChange(nextOpen: boolean) {
		if (assigningId) return;

		setOpen(nextOpen);
		setError("");
	}

	// The dialog stays open so several people can be assigned in a row.
	// After onAssigned() reloads the week, `shift` has the new lists.
	async function handleAssign(staffMemberId: string) {
		setAssigningId(staffMemberId);
		setError("");

		try {
			await createShiftAssignment(shift.id, staffMemberId);
			await onAssigned();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể xếp nhân viên lúc này.");
		} finally {
			setAssigningId(null);
		}
	}

	const shiftLabel = `${shift.name} · ${getWeekdayLabel(shift.shift_date)} ${formatDayMonth(
		shift.shift_date
	)}, ${formatShiftTime(shift.start_time)}–${formatShiftTime(shift.end_time)}`;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					// h-auto + flex-wrap: in a narrow day column "(N rảnh)" moves to a
					// second line instead of overflowing the shift card.
					className="h-auto min-h-8 w-full flex-wrap gap-y-0.5 py-1.5 whitespace-normal"
					aria-label={`Xếp nhân viên vào ${shiftLabel}`}
				>
					<span className="inline-flex items-center gap-1.5 whitespace-nowrap">
						<UserPlus aria-hidden="true" />
						Xếp nhân viên
					</span>
					<span className="text-muted-foreground font-normal whitespace-nowrap">
						({shift.available.length} rảnh)
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent
				className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
				showCloseButton={!assigningId}
			>
				<DialogHeader className="pr-8">
					<DialogTitle>Xếp nhân viên</DialogTitle>
					<DialogDescription>{shiftLabel}</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{error ? (
						<div
							role="alert"
							className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
						>
							<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							<p>{error}</p>
						</div>
					) : null}

					<section aria-labelledby={`${shift.id}-available`}>
						<h3
							id={`${shift.id}-available`}
							className="text-success flex items-center gap-2 text-sm font-semibold"
						>
							<CircleCheck aria-hidden="true" className="size-4" />
							Rảnh ({shift.available.length})
						</h3>
						{shift.available.length > 0 ? (
							<ul className="divide-border mt-2 divide-y rounded-lg border">
								{shift.available.map((member) => (
									<li
										key={member.staff_member_id}
										className="flex items-center justify-between gap-3 px-3 py-2"
									>
										<span className="truncate text-sm font-medium">
											{member.full_name}
										</span>
										<Button
											type="button"
											size="sm"
											onClick={() => handleAssign(member.staff_member_id)}
											disabled={assigningId !== null}
										>
											{assigningId === member.staff_member_id ? (
												<LoaderCircle
													aria-hidden="true"
													className="animate-spin motion-reduce:animate-none"
												/>
											) : null}
											Xếp
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground mt-2 text-sm">
								Không còn nhân viên rảnh chưa được xếp.
							</p>
						)}
					</section>

					<section aria-labelledby={`${shift.id}-busy`}>
						<h3
							id={`${shift.id}-busy`}
							className="text-warning flex items-center gap-2 text-sm font-semibold"
						>
							<TriangleAlert aria-hidden="true" className="size-4" />
							Bận ({shift.busy.length})
						</h3>
						{shift.busy.length > 0 ? (
							<ul className="divide-border mt-2 divide-y rounded-lg border">
								{shift.busy.map((member) => (
									<li
										key={member.staff_member_id}
										className="flex items-start justify-between gap-3 px-3 py-2"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">
												{member.full_name}
											</p>
											{member.busy_times.map((busyTime, index) => (
												<p
													key={index}
													className="text-muted-foreground text-xs leading-5"
												>
													{formatBusyTime(busyTime)}
												</p>
											))}
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => handleAssign(member.staff_member_id)}
											disabled={assigningId !== null}
											title="Nhân viên đã báo bận trong giờ này"
										>
											{assigningId === member.staff_member_id ? (
												<LoaderCircle
													aria-hidden="true"
													className="animate-spin motion-reduce:animate-none"
												/>
											) : null}
											Vẫn xếp
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground mt-2 text-sm">
								Không có nhân viên nào báo bận trong ca này.
							</p>
						)}
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
