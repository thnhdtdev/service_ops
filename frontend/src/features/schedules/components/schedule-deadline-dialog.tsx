"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CircleAlert, LoaderCircle, Save } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { updateScheduleWeek } from "@/features/schedules/api/update-schedule-week";
import {
	scheduleDeadlineSchema,
	type ScheduleDeadlineSchema
} from "@/features/schedules/schemas/schedule.schema";
import type { ScheduleWeek } from "@/features/schedules/types";
import { toDateTimeLocalValue } from "@/features/schedules/utils/schedule-dates";

type ScheduleDeadlineDialogProps = {
	week: ScheduleWeek;
	onSaved: () => void | Promise<void>;
};

export function ScheduleDeadlineDialog({ week, onSaved }: ScheduleDeadlineDialogProps) {
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const fieldId = useId();
	const { showSuccessToast } = useToast();
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ScheduleDeadlineSchema>({
		resolver: zodResolver(scheduleDeadlineSchema),
		defaultValues: {
			availability_deadline: toDateTimeLocalValue(week.availability_deadline)
		}
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		reset({ availability_deadline: toDateTimeLocalValue(week.availability_deadline) });
	}

	async function onSubmit(values: ScheduleDeadlineSchema) {
		setSubmitError("");

		try {
			await updateScheduleWeek(week.id, {
				availability_deadline: new Date(values.availability_deadline).toISOString()
			});
			await onSaved();
			setOpen(false);
			showSuccessToast({ title: "Đã đổi hạn chót báo lịch bận" });
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Không thể đổi hạn chót lúc này."
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" className="h-9">
					<CalendarClock aria-hidden="true" data-icon="inline-start" />
					Đổi hạn chót
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
				<DialogHeader className="pr-8">
					<DialogTitle>Đổi hạn chót báo lịch bận</DialogTitle>
					<DialogDescription>
						Nhân viên sửa được lịch bận đến thời điểm này. Có thể lùi hạn để nhân viên
						báo thêm.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit, () => setSubmitError(""))}
					aria-busy={isSubmitting}
					noValidate
				>
					<div className="space-y-5">
						{submitError ? (
							<div
								role="alert"
								className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
							>
								<CircleAlert
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0"
								/>
								<p>{submitError}</p>
							</div>
						) : null}

						<Field data-invalid={!!errors.availability_deadline}>
							<FieldLabel htmlFor={`${fieldId}-deadline`}>Hạn chót</FieldLabel>
							<Input
								id={`${fieldId}-deadline`}
								type="datetime-local"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.availability_deadline}
								{...register("availability_deadline")}
							/>
							<FieldError errors={[errors.availability_deadline]} />
						</Field>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircle
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<Save aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting ? "Đang lưu..." : "Lưu hạn chót"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
