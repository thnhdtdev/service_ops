"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, Plus } from "lucide-react";
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
import { createShift } from "@/features/schedules/api/create-shift";
import { shiftSchema, type ShiftSchema } from "@/features/schedules/schemas/schedule.schema";
import { formatDayMonth, getWeekdayLabel } from "@/features/schedules/utils/schedule-dates";

type AddShiftDialogProps = {
	weekId: string;
	// "YYYY-MM-DD" of the day the shift is added to
	shiftDate: string;
	onSaved: () => void | Promise<void>;
};

const defaultValues: ShiftSchema = {
	name: "",
	start_time: "08:00",
	end_time: "12:00"
};

export function AddShiftDialog({ weekId, shiftDate, onSaved }: AddShiftDialogProps) {
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const fieldId = useId();
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ShiftSchema>({
		resolver: zodResolver(shiftSchema),
		defaultValues
	});

	const dayLabel = `${getWeekdayLabel(shiftDate)}, ${formatDayMonth(shiftDate)}`;

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		reset(defaultValues);
	}

	async function onSubmit(values: ShiftSchema) {
		setSubmitError("");

		try {
			await createShift(weekId, { ...values, shift_date: shiftDate });
			await onSaved();
			setOpen(false);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Không thể thêm ca lúc này.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="text-muted-foreground w-full"
					aria-label={`Thêm ca vào ${dayLabel}`}
				>
					<Plus aria-hidden="true" data-icon="inline-start" />
					Thêm ca
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
				<DialogHeader className="pr-8">
					<DialogTitle>Thêm ca</DialogTitle>
					<DialogDescription>Thêm một ca riêng cho {dayLabel}.</DialogDescription>
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

						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor={`${fieldId}-name`}>Tên ca</FieldLabel>
							<Input
								id={`${fieldId}-name`}
								placeholder="Ví dụ: Ca tăng cường"
								autoComplete="off"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.name}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<div className="grid gap-5 sm:grid-cols-2">
							<Field data-invalid={!!errors.start_time}>
								<FieldLabel htmlFor={`${fieldId}-start`}>Bắt đầu</FieldLabel>
								<Input
									id={`${fieldId}-start`}
									type="time"
									className="h-11 font-mono tabular-nums"
									disabled={isSubmitting}
									aria-invalid={!!errors.start_time}
									{...register("start_time")}
								/>
								<FieldError errors={[errors.start_time]} />
							</Field>

							<Field data-invalid={!!errors.end_time}>
								<FieldLabel htmlFor={`${fieldId}-end`}>Kết thúc</FieldLabel>
								<Input
									id={`${fieldId}-end`}
									type="time"
									className="h-11 font-mono tabular-nums"
									disabled={isSubmitting}
									aria-invalid={!!errors.end_time}
									{...register("end_time")}
								/>
								<FieldError errors={[errors.end_time]} />
							</Field>
						</div>
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
								<Plus aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting ? "Đang thêm..." : "Thêm ca"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
