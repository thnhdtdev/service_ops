"use client";

import { LoaderCircle, Trash2, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteShift } from "@/features/schedules/api/delete-shift";
import { deleteShiftAssignment } from "@/features/schedules/api/delete-shift-assignment";
import { AssignStaffDialog } from "@/features/schedules/components/assign-staff-dialog";
import type { ShiftAvailability } from "@/features/schedules/types";
import { formatBusyTime } from "@/features/schedules/utils/format-busy-time";
import { formatShiftTime } from "@/features/schedules/utils/schedule-dates";
import { cn } from "@/lib/utils";

type ShiftCardProps = {
	shift: ShiftAvailability;
	onChanged: () => void | Promise<void>;
	onError: (message: string) => void;
};

export function ShiftCard({ shift, onChanged, onError }: ShiftCardProps) {
	// "shift" while deleting the shift, or the id of the staff member being removed.
	const [workingId, setWorkingId] = useState<string | null>(null);

	async function handleDeleteShift() {
		const confirmed = window.confirm(
			`Xóa ca "${shift.name}"? Những nhân viên đã xếp vào ca này cũng bị bỏ ra.`
		);

		if (!confirmed) return;

		setWorkingId("shift");

		try {
			await deleteShift(shift.id);
			await onChanged();
		} catch (error) {
			onError(error instanceof Error ? error.message : "Không thể xóa ca lúc này.");
		} finally {
			setWorkingId(null);
		}
	}

	async function handleRemove(staffMemberId: string) {
		setWorkingId(staffMemberId);

		try {
			await deleteShiftAssignment(shift.id, staffMemberId);
			await onChanged();
		} catch (error) {
			onError(error instanceof Error ? error.message : "Không thể bỏ nhân viên khỏi ca.");
		} finally {
			setWorkingId(null);
		}
	}

	return (
		<article className="border-border bg-background space-y-3 rounded-xl border p-3">
			<header className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h4 className="truncate text-sm font-semibold">{shift.name}</h4>
					<p className="text-muted-foreground font-mono text-xs tabular-nums">
						{formatShiftTime(shift.start_time)}–{formatShiftTime(shift.end_time)}
					</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={handleDeleteShift}
					disabled={workingId !== null}
					aria-label={`Xóa ca ${shift.name}`}
					title={`Xóa ca ${shift.name}`}
				>
					{workingId === "shift" ? (
						<LoaderCircle
							aria-hidden="true"
							className="animate-spin motion-reduce:animate-none"
						/>
					) : (
						<Trash2 aria-hidden="true" />
					)}
				</Button>
			</header>

			{shift.assigned.length > 0 ? (
				<ul className="space-y-1.5">
					{shift.assigned.map((member) => {
						const isConflict = member.busy_times.length > 0;

						return (
							<li
								key={member.staff_member_id}
								className={cn(
									"flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-xs",
									isConflict
										? "border-warning/40 bg-warning/10"
										: "border-border bg-muted/40"
								)}
							>
								{isConflict ? (
									<TriangleAlert
										aria-hidden="true"
										className="text-warning mt-0.5 size-3.5 shrink-0"
									/>
								) : null}
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">
										{member.full_name}
										{member.is_active ? null : (
											<span className="text-muted-foreground font-normal">
												{" "}
												(đã nghỉ)
											</span>
										)}
									</p>
									{member.busy_times.map((busyTime, index) => (
										<p key={index} className="text-muted-foreground leading-4">
											Trùng giờ bận: {formatBusyTime(busyTime)}
										</p>
									))}
								</div>
								<button
									type="button"
									onClick={() => handleRemove(member.staff_member_id)}
									disabled={workingId !== null}
									className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2 disabled:opacity-50"
									aria-label={`Bỏ ${member.full_name} khỏi ca ${shift.name}`}
									title="Bỏ khỏi ca"
								>
									{workingId === member.staff_member_id ? (
										<LoaderCircle
											aria-hidden="true"
											className="size-3.5 animate-spin motion-reduce:animate-none"
										/>
									) : (
										<X aria-hidden="true" className="size-3.5" />
									)}
								</button>
							</li>
						);
					})}
				</ul>
			) : (
				<p className="text-muted-foreground text-xs">Chưa xếp ai.</p>
			)}

			<AssignStaffDialog shift={shift} onAssigned={onChanged} />
		</article>
	);
}
