"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, Pencil, Save } from "lucide-react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { updateService } from "@/features/services/api/update-service";
import {
	updateServiceSchema,
	type UpdateServiceSchema
} from "@/features/services/schemas/update-service.schema";
import type { Service } from "@/features/services/types";

type EditServiceDialogProps = {
	service: Service;
	onUpdated: (service: Service) => void | Promise<void>;
};

function getDefaultValues(service: Service): UpdateServiceSchema {
	return {
		name: service.name,
		unit: service.unit,
		unit_price: Number(service.unit_price),
		description: service.description ?? "",
		is_active: service.is_active
	};
}

export function EditServiceDialog({ service, onUpdated }: EditServiceDialogProps) {
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const fieldId = useId();
	const { showSuccessToast } = useToast();
	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isDirty, isSubmitting }
	} = useForm<UpdateServiceSchema>({
		resolver: zodResolver(updateServiceSchema),
		defaultValues: getDefaultValues(service)
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);
		setSubmitError("");
		reset(getDefaultValues(service));
	}

	async function onSubmit(values: UpdateServiceSchema) {
		setSubmitError("");

		try {
			const updatedService = await updateService(service.id, {
				...values,
				description: values.description || null
			});

			await onUpdated(updatedService);
			setOpen(false);
			showSuccessToast({
				title: "Cập nhật dịch vụ thành công",
				description: `${updatedService.name} đã được lưu vào bảng giá.`
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Không thể cập nhật dịch vụ lúc này."
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Chỉnh sửa ${service.name}`}
					title={`Chỉnh sửa ${service.name}`}
				>
					<Pencil aria-hidden="true" />
				</Button>
			</DialogTrigger>

			<DialogContent
				className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
				showCloseButton={!isSubmitting}
			>
				<DialogHeader className="pr-8">
					<DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
					<DialogDescription>
						Cập nhật bảng giá và trạng thái cung cấp của {service.name}.
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
							<FieldLabel htmlFor={`${fieldId}-name`}>Tên dịch vụ</FieldLabel>
							<Input
								id={`${fieldId}-name`}
								autoComplete="off"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
								{...register("name")}
							/>
							<FieldError id={`${fieldId}-name-error`} errors={[errors.name]} />
						</Field>

						<div className="grid gap-5 sm:grid-cols-2">
							<Field data-invalid={!!errors.unit}>
								<FieldLabel htmlFor={`${fieldId}-unit`}>Đơn vị tính</FieldLabel>
								<Controller
									name="unit"
									control={control}
									render={({ field }) => (
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={isSubmitting}
										>
											<SelectTrigger
												id={`${fieldId}-unit`}
												className="h-11 w-full"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(SERVICE_UNIT_LABEL).map(
													([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									)}
								/>
								<FieldError errors={[errors.unit]} />
							</Field>

							<Field data-invalid={!!errors.is_active}>
								<FieldLabel htmlFor={`${fieldId}-status`}>Trạng thái</FieldLabel>
								<Controller
									name="is_active"
									control={control}
									render={({ field }) => (
										<div className="border-input flex h-9 items-center justify-between gap-4 rounded-md border px-3">
											<span className="text-sm font-medium">
												{field.value ? "Đang cung cấp" : "Tạm ngừng"}
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
														? "Tạm ngừng dịch vụ"
														: "Bật cung cấp dịch vụ"
												}
											/>
										</div>
									)}
								/>
							</Field>
						</div>

						<Field data-invalid={!!errors.unit_price}>
							<FieldLabel htmlFor={`${fieldId}-unit-price`}>Đơn giá</FieldLabel>
							<div className="relative">
								<Input
									id={`${fieldId}-unit-price`}
									type="number"
									min="1"
									step="1000"
									inputMode="numeric"
									className="h-11 pr-9 font-mono tabular-nums"
									disabled={isSubmitting}
									aria-invalid={!!errors.unit_price}
									aria-describedby={
										errors.unit_price
											? `${fieldId}-unit-price-error`
											: undefined
									}
									{...register("unit_price", {
										setValueAs: (value) => (value === "" ? 0 : Number(value))
									})}
								/>
								<span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
									đ
								</span>
							</div>
							<FieldError
								id={`${fieldId}-unit-price-error`}
								errors={[errors.unit_price]}
							/>
						</Field>

						<Field data-invalid={!!errors.description}>
							<FieldLabel htmlFor={`${fieldId}-description`}>
								Mô tả{" "}
								<span className="text-muted-foreground font-normal">
									(không bắt buộc)
								</span>
							</FieldLabel>
							<Textarea
								id={`${fieldId}-description`}
								placeholder="Mô tả ngắn để nhân viên dễ phân biệt dịch vụ"
								rows={3}
								disabled={isSubmitting}
								aria-invalid={!!errors.description}
								{...register("description")}
							/>
							<FieldError errors={[errors.description]} />
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
						<Button type="submit" disabled={isSubmitting || !isDirty}>
							{isSubmitting ? (
								<LoaderCircle
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<Save aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
