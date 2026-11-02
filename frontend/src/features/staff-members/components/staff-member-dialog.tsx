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
import { createStaffMember } from "@/features/staff-members/api/create-staff-member";
import { updateStaffMember } from "@/features/staff-members/api/update-staff-member";
import {
	staffMemberSchema,
	type StaffMemberSchema
} from "@/features/staff-members/schemas/staff-member.schema";
import type { StaffMember } from "@/features/staff-members/types";

type StaffMemberDialogProps = {
	// Not set = add a new staff member. Set = edit this staff member.
	staffMember?: StaffMember;
	onSaved: () => void | Promise<void>;
};

function getDefaultValues(staffMember?: StaffMember): StaffMemberSchema {
	return {
		full_name: staffMember?.full_name ?? "",
		phone: staffMember?.phone ?? "",
		is_active: staffMember?.is_active ?? true
	};
}

export function StaffMemberDialog({ staffMember, onSaved }: StaffMemberDialogProps) {
	const isEditing = staffMember !== undefined;
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
	} = useForm<StaffMemberSchema>({
		resolver: zodResolver(staffMemberSchema),
		defaultValues: getDefaultValues(staffMember)
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		// Start from the latest data every time the dialog opens or closes.
		reset(getDefaultValues(staffMember));
	}

	async function onSubmit(values: StaffMemberSchema) {
		setSubmitError("");

		const input = {
			full_name: values.full_name,
			phone: values.phone || null
		};

		try {
			if (isEditing) {
				await updateStaffMember(staffMember.id, {
					...input,
					is_active: values.is_active
				});
			} else {
				await createStaffMember(input);
			}

			await onSaved();
			setOpen(false);
			reset(getDefaultValues(staffMember));
			showSuccessToast({
				title: isEditing ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên",
				description: values.full_name
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Không thể lưu nhân viên lúc này."
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
						aria-label={`Chỉnh sửa ${staffMember.full_name}`}
						title={`Chỉnh sửa ${staffMember.full_name}`}
					>
						<Pencil aria-hidden="true" />
					</Button>
				) : (
					<Button type="button" className="h-9">
						<Plus aria-hidden="true" data-icon="inline-start" />
						Thêm nhân viên
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
				showCloseButton={!isSubmitting}
			>
				<DialogHeader className="pr-8">
					<DialogTitle>
						{isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
					</DialogTitle>
					<DialogDescription>
						Nhân viên không cần tài khoản. Sau khi thêm, hãy tạo link riêng để nhân viên
						báo lịch bận và xem lịch làm.
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

						<Field data-invalid={!!errors.full_name}>
							<FieldLabel htmlFor={`${fieldId}-name`}>Họ tên</FieldLabel>
							<Input
								id={`${fieldId}-name`}
								placeholder="Ví dụ: Nguyễn Thị Lan"
								autoComplete="off"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.full_name}
								{...register("full_name")}
							/>
							<FieldError errors={[errors.full_name]} />
						</Field>

						<Field data-invalid={!!errors.phone}>
							<FieldLabel htmlFor={`${fieldId}-phone`}>
								Số điện thoại{" "}
								<span className="text-muted-foreground font-normal">
									(không bắt buộc)
								</span>
							</FieldLabel>
							<Input
								id={`${fieldId}-phone`}
								type="tel"
								inputMode="numeric"
								placeholder="0901234567"
								autoComplete="off"
								className="h-11 font-mono tabular-nums"
								disabled={isSubmitting}
								aria-invalid={!!errors.phone}
								{...register("phone")}
							/>
							<FieldError errors={[errors.phone]} />
						</Field>

						{isEditing ? (
							<Field>
								<FieldLabel htmlFor={`${fieldId}-status`}>Trạng thái</FieldLabel>
								<Controller
									name="is_active"
									control={control}
									render={({ field }) => (
										<div className="border-input flex h-9 items-center justify-between gap-4 rounded-md border px-3">
											<span className="text-sm font-medium">
												{field.value ? "Đang làm" : "Đã nghỉ"}
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
													field.value
														? "Chuyển sang đã nghỉ"
														: "Chuyển sang đang làm"
												}
											/>
										</div>
									)}
								/>
								<FieldDescription>
									Chuyển sang &quot;Đã nghỉ&quot; sẽ vô hiệu hóa link của nhân
									viên.
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
							) : isEditing ? (
								<Save aria-hidden="true" data-icon="inline-start" />
							) : (
								<Plus aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting
								? "Đang lưu..."
								: isEditing
									? "Lưu thay đổi"
									: "Thêm nhân viên"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
