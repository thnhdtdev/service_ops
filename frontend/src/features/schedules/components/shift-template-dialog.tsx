"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, Pencil, Plus, Save } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { createShiftTemplate } from "@/features/schedules/api/create-shift-template";
import { updateShiftTemplate } from "@/features/schedules/api/update-shift-template";
import {
	shiftTemplateSchema,
	type ShiftTemplateSchema
} from "@/features/schedules/schemas/schedule.schema";
import type { ShiftTemplate } from "@/features/schedules/types";
import { formatShiftTime } from "@/features/schedules/utils/schedule-dates";

type ShiftTemplateDialogProps = {
	// Not set = add a new template. Set = edit this template.
	shiftTemplate?: ShiftTemplate;
	// Sort order suggested for a new template
	nextSortOrder?: number;
	onSaved: () => void | Promise<void>;
};

function getDefaultValues(
	shiftTemplate: ShiftTemplate | undefined,
	nextSortOrder: number
): ShiftTemplateSchema {
	return {
		name: shiftTemplate?.name ?? "",
		start_time: shiftTemplate ? formatShiftTime(shiftTemplate.start_time) : "08:00",
		end_time: shiftTemplate ? formatShiftTime(shiftTemplate.end_time) : "12:00",
		sort_order: shiftTemplate?.sort_order ?? nextSortOrder,
		is_active: shiftTemplate?.is_active ?? true
	};
}

export function ShiftTemplateDialog({
	shiftTemplate,
	nextSortOrder = 0,
	onSaved
}: ShiftTemplateDialogProps) {
	const isEditing = shiftTemplate !== undefined;
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const fieldId = useId();
	const { showSuccessToast } = useToast();
	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ShiftTemplateSchema>({
		resolver: zodResolver(shiftTemplateSchema),
		defaultValues: getDefaultValues(shiftTemplate, nextSortOrder)
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		reset(getDefaultValues(shiftTemplate, nextSortOrder));
	}

	async function onSubmit(values: ShiftTemplateSchema) {
		setSubmitError("");

		try {
			if (isEditing) {
				await updateShiftTemplate(shiftTemplate.id, values);
			} else {
				await createShiftTemplate(values);
			}

			await onSaved();
			setOpen(false);
			showSuccessToast({
				title: isEditing ? "Đã cập nhật ca mẫu" : "Đã thêm ca mẫu",
				description: `${values.name} (${values.start_time}–${values.end_time})`
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Không thể lưu ca mẫu lúc này."
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{isEditing ? (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={`Chỉnh sửa ca mẫu ${shiftTemplate.name}`}
						title={`Chỉnh sửa ca mẫu ${shiftTemplate.name}`}
					>
						<Pencil aria-hidden="true" />
					</Button>
				) : (
					<Button type="button" variant="outline" className="h-9">
						<Plus aria-hidden="true" data-icon="inline-start" />
						Thêm ca mẫu
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
				<DialogHeader className="pr-8">
					<DialogTitle>{isEditing ? "Chỉnh sửa ca mẫu" : "Thêm ca mẫu"}</DialogTitle>
					<DialogDescription>
						Ca mẫu đang bật được sao chép vào mỗi tuần mới. Sửa ca mẫu không ảnh hưởng
						các tuần đã tạo.
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

						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor={`${fieldId}-name`}>Tên ca</FieldLabel>
							<Input
								id={`${fieldId}-name`}
								placeholder="Ví dụ: Ca sáng"
								autoComplete="off"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.name}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<div className="grid gap-5 sm:grid-cols-3">
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

							<Field data-invalid={!!errors.sort_order}>
								<FieldLabel htmlFor={`${fieldId}-order`}>Thứ tự</FieldLabel>
								<Input
									id={`${fieldId}-order`}
									type="number"
									min="0"
									inputMode="numeric"
									className="h-11 font-mono tabular-nums"
									disabled={isSubmitting}
									aria-invalid={!!errors.sort_order}
									{...register("sort_order", {
										setValueAs: (value) => (value === "" ? 0 : Number(value))
									})}
								/>
								<FieldError errors={[errors.sort_order]} />
							</Field>
						</div>

						{isEditing ? (
							<Field>
								<FieldLabel htmlFor={`${fieldId}-status`}>Trạng thái</FieldLabel>
								<Controller
									name="is_active"
									control={control}
									render={({ field }) => (
										<div className="border-input flex h-9 items-center justify-between gap-4 rounded-md border px-3">
											<span className="text-sm font-medium">
												{field.value ? "Đang dùng" : "Tạm tắt"}
											</span>
											<Switch
												id={`${fieldId}-status`}
												checked={field.value}
												onCheckedChange={field.onChange}
												onBlur={field.onBlur}
												name={field.name}
												ref={field.ref}
												disabled={isSubmitting}
												aria-label={
													field.value ? "Tắt ca mẫu" : "Bật ca mẫu"
												}
											/>
										</div>
									)}
								/>
								<FieldDescription>
									Ca mẫu tạm tắt sẽ không được sao chép vào tuần mới.
								</FieldDescription>
							</Field>
						) : null}
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
							{isSubmitting ? "Đang lưu..." : "Lưu ca mẫu"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
