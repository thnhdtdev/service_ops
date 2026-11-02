"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, CircleAlert, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PATHS } from "@/constants/routes";
import { createScheduleWeek } from "@/features/schedules/api/create-schedule-week";
import {
	createScheduleWeekSchema,
	type CreateScheduleWeekSchema
} from "@/features/schedules/schemas/schedule.schema";
import { addDays, getNextMonday } from "@/features/schedules/utils/schedule-dates";

// Next Monday, with the deadline on the Saturday before at 20:00.
function getDefaultValues(): CreateScheduleWeekSchema {
	const weekStart = getNextMonday();

	return {
		week_start: weekStart,
		availability_deadline: `${addDays(weekStart, -2)}T20:00`
	};
}

export function CreateScheduleWeekDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const fieldId = useId();
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<CreateScheduleWeekSchema>({
		resolver: zodResolver(createScheduleWeekSchema),
		defaultValues: getDefaultValues()
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		reset(getDefaultValues());
	}

	async function onSubmit(values: CreateScheduleWeekSchema) {
		setSubmitError("");

		try {
			const week = await createScheduleWeek({
				week_start: values.week_start,
				// datetime-local has no time zone: new Date() reads it as local
				// time, toISOString() sends it to the backend in UTC.
				availability_deadline: new Date(values.availability_deadline).toISOString()
			});

			router.push(`${PATHS.SCHEDULES}/${week.id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Không thể tạo tuần lúc này.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type="button" className="h-9">
					<CalendarPlus aria-hidden="true" data-icon="inline-start" />
					Tạo tuần mới
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
				<DialogHeader className="pr-8">
					<DialogTitle>Tạo tuần mới</DialogTitle>
					<DialogDescription>
						Các ca mẫu đang dùng sẽ được sao chép vào 7 ngày của tuần. Nhân viên báo
						lịch bận qua link cho đến hạn chót.
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

						<Field data-invalid={!!errors.week_start}>
							<FieldLabel htmlFor={`${fieldId}-week-start`}>
								Thứ Hai đầu tuần
							</FieldLabel>
							<Input
								id={`${fieldId}-week-start`}
								type="date"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.week_start}
								{...register("week_start")}
							/>
							<FieldError errors={[errors.week_start]} />
						</Field>

						<Field data-invalid={!!errors.availability_deadline}>
							<FieldLabel htmlFor={`${fieldId}-deadline`}>
								Hạn chót báo lịch bận
							</FieldLabel>
							<Input
								id={`${fieldId}-deadline`}
								type="datetime-local"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.availability_deadline}
								{...register("availability_deadline")}
							/>
							<FieldDescription>
								Sau hạn chót, nhân viên không sửa được lịch bận nữa.
							</FieldDescription>
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
								<CalendarPlus aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting ? "Đang tạo..." : "Tạo tuần"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
