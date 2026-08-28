"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { createService } from "@/features/services/api/create-service";
import {
	createServiceSchema,
	type CreateServiceSchema
} from "@/features/services/schemas/create-service.schema";
import type { Service } from "@/features/services/types";

type CreateServiceDialogProps = {
	onCreated: (service: Service) => void | Promise<void>;
};

const defaultValues: DefaultValues<CreateServiceSchema> = {
	name: "",
	unit: "kg",
	unit_price: undefined,
	description: ""
};

export function CreateServiceDialog({ onCreated }: CreateServiceDialogProps) {
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const { showSuccessToast } = useToast();
	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<CreateServiceSchema>({
		resolver: zodResolver(createServiceSchema),
		defaultValues
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting) return;

		setOpen(nextOpen);

		if (!nextOpen) {
			setSubmitError("");
			reset(defaultValues);
		}
	}

	async function onSubmit(values: CreateServiceSchema) {
		setSubmitError("");

		try {
			const service = await createService({
				...values,
				description: values.description || null
			});

			await onCreated(service);
			reset(defaultValues);
			setOpen(false);
			showSuccessToast({
				title: "Tạo dịch vụ thành công",
				description: `${service.name} đã được thêm vào bảng giá.`
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Không thể tạo dịch vụ lúc này."
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type="button" className="h-9">
					<Plus aria-hidden="true" data-icon="inline-start" />
					Thêm dịch vụ
				</Button>
			</DialogTrigger>

			<DialogContent
				className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
				showCloseButton={!isSubmitting}
			>
				<DialogHeader className="pr-8">
					<DialogTitle>Thêm dịch vụ mới</DialogTitle>
					<DialogDescription>
						Thiết lập tên, đơn vị tính và đơn giá áp dụng tại cửa hàng.
					</DialogDescription>
				</DialogHeader>

				<div className="bg-primary/5 text-foreground border-primary/15 flex items-start gap-3 rounded-lg border px-3.5 py-3">
					<CircleCheck
						aria-hidden="true"
						className="text-primary mt-0.5 size-4 shrink-0"
					/>
					<p className="text-sm leading-5">
						Dịch vụ mới sẽ được bật và xuất hiện ngay trong bảng giá.
					</p>
				</div>

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
							<FieldLabel htmlFor="service-name">Tên dịch vụ</FieldLabel>
							<Input
								id="service-name"
								placeholder="Ví dụ: Giặt sấy tiêu chuẩn"
								autoComplete="off"
								className="h-11"
								disabled={isSubmitting}
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? "service-name-error" : undefined}
								{...register("name")}
							/>
							<FieldError id="service-name-error" errors={[errors.name]} />
						</Field>

						<div className="grid gap-5 sm:grid-cols-2">
							<Field data-invalid={!!errors.unit}>
								<FieldLabel htmlFor="service-unit">Đơn vị tính</FieldLabel>
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
												id="service-unit"
												className="h-11 w-full"
												aria-invalid={!!errors.unit}
												aria-describedby={
													errors.unit ? "service-unit-error" : undefined
												}
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
								<FieldError id="service-unit-error" errors={[errors.unit]} />
							</Field>

							<Field data-invalid={!!errors.unit_price}>
								<FieldLabel htmlFor="service-unit-price">Đơn giá</FieldLabel>
								<div className="relative">
									<Input
										id="service-unit-price"
										type="number"
										min="1"
										step="1000"
										inputMode="numeric"
										placeholder="25000"
										className="h-11 pr-9 font-mono tabular-nums"
										disabled={isSubmitting}
										aria-invalid={!!errors.unit_price}
										aria-describedby={
											errors.unit_price
												? "service-unit-price-help service-unit-price-error"
												: "service-unit-price-help"
										}
										{...register("unit_price", {
											setValueAs: (value) =>
												value === "" ? 0 : Number(value)
										})}
									/>
									<span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
										đ
									</span>
								</div>
								<FieldDescription id="service-unit-price-help">
									Nhập giá trước khuyến mãi.
								</FieldDescription>
								<FieldError
									id="service-unit-price-error"
									errors={[errors.unit_price]}
								/>
							</Field>
						</div>

						<Field data-invalid={!!errors.description}>
							<FieldLabel htmlFor="service-description">
								Mô tả{" "}
								<span className="text-muted-foreground font-normal">
									(không bắt buộc)
								</span>
							</FieldLabel>
							<Textarea
								id="service-description"
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
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircle
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<Plus aria-hidden="true" data-icon="inline-start" />
							)}
							{isSubmitting ? "Đang tạo..." : "Tạo dịch vụ"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
