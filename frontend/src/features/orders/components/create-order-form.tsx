"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

import { getOrder } from "@/features/orders/api/get-order";
import { OrderReceipt } from "@/features/orders/components/order-receipt";
import { RECEIPT_PAGE_STYLE } from "@/features/orders/components/receipt-print-style";
import { createOrder } from "@/features/orders/api/create-order";
import type { CustomerSummary } from "@/features/customers/types";
import { useCustomerLookup } from "@/features/customers/hooks/use-customer-lookup";
import { normalizeCustomerPhone } from "@/features/customers/utils/normalize-customer-phone";
import { useActiveServices } from "@/features/services/hooks/use-active-services";
import type { CreateOrderFormValues } from "@/features/orders/type";

import { formatCurrency } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment-method";
import { PAYMENT_STATUS_LABEL } from "@/constants/payment-status";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { calculateOrderLineTotal } from "@/features/orders/utils/calculate-order-total";

type CreateOrderFormProps = {
	onSuccess?: () => void;
};

const defaultValues: CreateOrderFormValues = {
	customerName: "",
	customerPhone: "",
	dueAt: "",
	note: "",
	discountType: "percent",
	discountValue: 0,
	paymentStatus: "unpaid",
	paymentMethod: "cash",
	items: [
		{
			serviceId: "",
			quantity: 1
		}
	]
};

export function CreateOrderForm({ onSuccess }: CreateOrderFormProps) {
	const router = useRouter();
	const receiptRef = useRef<HTMLDivElement>(null);

	const hasRequestedPrintRef = useRef(false);

	const createdOrderIdRef = useRef<string | null>(null);

	const [receiptData, setReceiptData] = useState<Awaited<ReturnType<typeof getOrder>> | null>(
		null
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState("");
	const { services, isLoadingServices, error: servicesError } = useActiveServices();

	const form = useForm<CreateOrderFormValues>({
		defaultValues
	});

	const {
		control,
		clearErrors,
		getValues,
		register,
		handleSubmit,
		reset,
		setFocus,
		setValue,
		formState: { errors }
	} = form;

	const watchedItemsValue = useWatch({
		control,
		name: "items"
	});
	const watchedItems = useMemo(() => watchedItemsValue ?? [], [watchedItemsValue]);

	const customerPhone = useWatch({
		control,
		name: "customerPhone"
	});
	const {
		customer: matchedCustomer,
		status: customerLookupStatus,
		error: customerLookupError
	} = useCustomerLookup(customerPhone);
	const previousMatchedCustomer = useRef<CustomerSummary | null>(null);

	const paymentStatus = useWatch({
		control,
		name: "paymentStatus"
	});

	const discountType = useWatch({
		control,
		name: "discountType"
	});

	const discountValue = useWatch({
		control,
		name: "discountValue"
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items"
	});

	useEffect(() => {
		const previousCustomer = previousMatchedCustomer.current;

		if (matchedCustomer) {
			setValue("customerName", matchedCustomer.name, {
				shouldDirty: true,
				shouldValidate: true
			});
			clearErrors("customerName");
		} else if (previousCustomer && getValues("customerName") === previousCustomer.name) {
			setValue("customerName", "", {
				shouldDirty: true
			});
		}

		previousMatchedCustomer.current = matchedCustomer;
	}, [clearErrors, getValues, matchedCustomer, setValue]);

	const subtotal = useMemo(() => {
		return watchedItems.reduce((total, item) => {
			const selectedService = services.find((service) => {
				return service.id === item.serviceId;
			});

			if (!selectedService) {
				return total;
			}

			const quantity = Number(item.quantity || 0);
			const unitPrice = Number(selectedService.unit_price || 0);

			if (quantity <= 0) {
				return total;
			}

			return (
				total +
				calculateOrderLineTotal({
					quantity,
					unitPrice
				})
			);
		}, 0);
	}, [watchedItems, services]);

	const discountAmount = useMemo(() => {
		const value = Number(discountValue || 0);

		if (value <= 0) {
			return 0;
		}

		if (discountType === "percent") {
			const percent = Math.min(value, 100);

			return Math.round((subtotal * percent) / 100);
		}

		return Math.min(value, subtotal);
	}, [discountType, discountValue, subtotal]);

	const totalAmount = subtotal - discountAmount;

	const handlePrint = useReactToPrint({
		contentRef: receiptRef,

		documentTitle: receiptData?.order.order_code
			? `Hoa-don-${receiptData.order.order_code}`
			: "Hoa-don",

		pageStyle: RECEIPT_PAGE_STYLE,

		onAfterPrint: () => {
			reset(defaultValues);

			setReceiptData(null);
			setIsSubmitting(false);

			router.refresh();
			onSuccess?.();
		},

		onPrintError: (_location, error) => {
			console.error("Receipt print error:", error);

			setIsSubmitting(false);

			setFormError(
				"Đơn hàng đã được tạo nhưng không thể mở cửa sổ in. Bạn có thể vào chi tiết đơn để in lại."
			);

			const orderId = createdOrderIdRef.current;

			if (orderId) {
				router.push(`/orders/${orderId}`);
			}
		}
	});

	useEffect(() => {
		if (!receiptData || hasRequestedPrintRef.current) {
			return;
		}

		hasRequestedPrintRef.current = true;

		const timer = window.setTimeout(() => {
			handlePrint();
		}, 150);

		return () => {
			window.clearTimeout(timer);
		};
	}, [receiptData, handlePrint]);

	async function onSubmit(values: CreateOrderFormValues) {
		setFormError("");

		if (values.items.length === 0) {
			setFormError("Vui lòng thêm ít nhất một dịch vụ.");
			return;
		}

		const validItems = values.items
			.map((item) => {
				const service = services.find((serviceItem) => serviceItem.id === item.serviceId);

				const quantity = Number(item.quantity || 0);

				if (!service || quantity <= 0) {
					return null;
				}

				return {
					serviceId: service.id,
					quantity
				};
			})
			.filter(
				(
					item
				): item is {
					serviceId: string;
					quantity: number;
				} => item !== null
			);

		if (validItems.length === 0) {
			setFormError("Vui lòng chọn dịch vụ và nhập số lượng hợp lệ.");
			return;
		}

		const customerName = values.customerName.trim();
		const normalizedCustomerPhone = normalizeCustomerPhone(values.customerPhone);

		if (!normalizedCustomerPhone) {
			setFormError("Số điện thoại khách hàng không hợp lệ.");
			return;
		}

		setIsSubmitting(true);

		hasRequestedPrintRef.current = false;
		createdOrderIdRef.current = null;
		setReceiptData(null);

		let createdOrderId: string | null = null;

		try {
			const createdOrder = await createOrder({
				customer: {
					name: customerName,
					phone: normalizedCustomerPhone
				},

				items: validItems.map((item) => ({
					service_id: item.serviceId,
					quantity: item.quantity
				})),

				discount_type: values.discountValue > 0 ? values.discountType : null,

				discount_value: values.discountValue || 0,

				payment_status: values.paymentStatus,

				payment_method: values.paymentStatus === "paid" ? values.paymentMethod : undefined,

				due_at: values.dueAt ? new Date(values.dueAt).toISOString() : null,

				note: values.note.trim() || null
			});

			const orderId = createdOrder.order.id;

			if (!orderId) {
				throw new Error("Không nhận được ID của đơn hàng vừa tạo.");
			}

			createdOrderId = orderId;
			createdOrderIdRef.current = orderId;

			const orderDetail = await getOrder(orderId);

			setReceiptData(orderDetail);
		} catch (error) {
			console.error(error);

			if (createdOrderId) {
				setIsSubmitting(false);

				setFormError("Đơn hàng đã được tạo thành công nhưng chưa thể tải hóa đơn để in.");

				router.push(`/orders/${createdOrderId}`);

				return;
			}

			setIsSubmitting(false);

			setFormError(
				error instanceof Error ? error.message : "Tạo đơn hàng thất bại. Vui lòng thử lại."
			);
		}
	}

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{formError ? (
					<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
						{formError}
					</div>
				) : null}

				<section className="border-border bg-card rounded-2xl border p-4">
					<h3 className="text-card-foreground text-base font-semibold">
						Thông tin khách hàng
					</h3>

					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="customer-phone" className="text-sm font-medium">
								Số điện thoại
							</label>
							<Input
								id="customer-phone"
								type="tel"
								placeholder="09xxxxxxxx"
								autoComplete="tel"
								{...register("customerPhone", {
									required: "Vui lòng nhập số điện thoại",
									validate: (value) =>
										normalizeCustomerPhone(value) !== null ||
										"Số điện thoại không hợp lệ",
									onChange: (event) => {
										event.target.value = event.target.value.replace(
											/[^0-9+]/g,
											""
										);
									}
								})}
							/>
							{errors.customerPhone ? (
								<p className="text-destructive text-sm">
									{errors.customerPhone.message}
								</p>
							) : null}

							<div aria-live="polite">
								{customerLookupStatus === "searching" ? (
									<p role="status" className="text-muted-foreground text-sm">
										Đang tìm khách hàng...
									</p>
								) : customerLookupStatus === "found" && matchedCustomer ? (
									<div className="border-success/30 bg-success/10 text-success flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
										<p>
											Khách hàng cũ: <strong>{matchedCustomer.name}</strong>
										</p>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="text-foreground shrink-0"
											onClick={() => {
												setValue("customerPhone", "");
												setValue("customerName", "");
												setFocus("customerPhone");
											}}
										>
											Đổi khách
										</Button>
									</div>
								) : customerLookupStatus === "not-found" ? (
									<p
										role="status"
										className="border-primary/30 bg-primary/5 text-foreground rounded-lg border px-3 py-2 text-sm"
									>
										Khách hàng mới. Hồ sơ sẽ được tạo cùng đơn hàng.
									</p>
								) : customerLookupStatus === "error" ? (
									<p
										role="alert"
										className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
									>
										{customerLookupError}
									</p>
								) : null}
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="customer-name" className="text-sm font-medium">
								Tên khách hàng
							</label>
							<Input
								id="customer-name"
								placeholder={
									matchedCustomer
										? "Thông tin từ hồ sơ khách hàng"
										: "Ví dụ: Chị Linh"
								}
								readOnly={!!matchedCustomer}
								className={matchedCustomer ? "bg-muted" : undefined}
								{...register("customerName", {
									required: "Vui lòng nhập tên khách hàng"
								})}
							/>
							{errors.customerName ? (
								<p className="text-destructive text-sm">
									{errors.customerName.message}
								</p>
							) : null}
							{matchedCustomer ? (
								<p className="text-muted-foreground text-xs">
									Tên được lấy từ hồ sơ hiện có và không bị cập nhật ngầm.
								</p>
							) : null}
						</div>
					</div>
				</section>

				<section className="border-border bg-card rounded-2xl border p-4">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h3 className="text-card-foreground text-base font-semibold">
								Dịch vụ
							</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								Chọn dịch vụ, nhập số lượng và hệ thống sẽ tự tính tiền.
							</p>
						</div>

						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isLoadingServices || !!servicesError || services.length === 0}
							onClick={() => append({ serviceId: "", quantity: 1 })}
						>
							<Plus className="mr-2 size-4" />
							Thêm dịch vụ
						</Button>
					</div>

					<div className="mt-3" aria-live="polite">
						{isLoadingServices ? (
							<p role="status" className="text-muted-foreground text-sm">
								Đang tải danh sách dịch vụ...
							</p>
						) : servicesError ? (
							<p
								role="alert"
								className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
							>
								{servicesError}
							</p>
						) : services.length === 0 ? (
							<p role="status" className="text-muted-foreground text-sm">
								Chưa có dịch vụ đang hoạt động.
							</p>
						) : (
							<p role="status" className="text-muted-foreground text-sm">
								Đã tải {services.length} dịch vụ.
							</p>
						)}
					</div>

					<div className="mt-4 space-y-3">
						{fields.map((field, index) => {
							const selectedService = services.find((service) => {
								return service.id === watchedItems[index]?.serviceId;
							});

							const quantity = Number(watchedItems[index]?.quantity || 0);
							const unitPrice = Number(selectedService?.unit_price || 0);
							const lineTotal = calculateOrderLineTotal({
								quantity,
								unitPrice
							});

							return (
								<div
									key={field.id}
									className="border-border grid gap-3 rounded-xl border p-3 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto]"
								>
									<div className="space-y-2">
										<label className="text-sm font-medium">Dịch vụ</label>
										<select
											className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
											disabled={
												isLoadingServices ||
												!!servicesError ||
												services.length === 0
											}
											{...register(`items.${index}.serviceId`, {
												required: true
											})}
										>
											<option value="">
												{isLoadingServices
													? "Đang tải..."
													: servicesError
														? "Không thể tải dịch vụ"
														: services.length === 0
															? "Chưa có dịch vụ"
															: "Chọn dịch vụ"}
											</option>

											{services.map((service) => (
												<option key={service.id} value={service.id}>
													{service.name}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Số lượng</label>
										<Input
											type="number"
											min="0"
											step="0.1"
											{...register(`items.${index}.quantity`, {
												valueAsNumber: true,
												min: 0.1
											})}
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Đơn vị</label>
										<div className="border-border bg-muted text-muted-foreground flex h-9 items-center rounded-md border px-3 text-sm">
											{selectedService
												? SERVICE_UNIT_LABEL[selectedService.unit]
												: "-"}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Thành tiền</label>
										<div className="border-border bg-muted flex h-9 items-center rounded-md border px-3 text-sm font-medium tabular-nums">
											{formatCurrency(lineTotal)}
										</div>
									</div>

									<div className="flex items-end">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											disabled={fields.length === 1}
											onClick={() => remove(index)}
										>
											<Trash2 className="size-4" />
											<span className="sr-only">Xóa dịch vụ</span>
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<section className="border-border bg-card rounded-2xl border p-4">
					<h3 className="text-card-foreground text-base font-semibold">
						Thanh toán và ghi chú
					</h3>

					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium">Trạng thái thanh toán</label>
							<select
								className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
								{...register("paymentStatus")}
							>
								<option value="unpaid">{PAYMENT_STATUS_LABEL.unpaid}</option>
								<option value="paid">{PAYMENT_STATUS_LABEL.paid}</option>
							</select>
						</div>

						{paymentStatus === "paid" ? (
							<div className="space-y-2">
								<label className="text-sm font-medium">
									Phương thức thanh toán
								</label>
								<select
									className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
									{...register("paymentMethod")}
								>
									<option value="cash">{PAYMENT_METHOD_LABEL.cash}</option>
									<option value="bank_transfer">
										{PAYMENT_METHOD_LABEL.bank_transfer}
									</option>
									<option value="other">{PAYMENT_METHOD_LABEL.other}</option>
								</select>
							</div>
						) : null}

						<div className="space-y-2">
							<label className="text-sm font-medium">Hẹn lấy</label>
							<Input type="datetime-local" {...register("dueAt")} />
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Ghi chú</label>
							<Input
								placeholder="Ví dụ: Khách cần lấy trước 18h"
								{...register("note")}
							/>
						</div>
					</div>
				</section>

				<section className="border-border bg-card rounded-2xl border p-4">
					<h3 className="text-card-foreground text-base font-semibold">
						Tổng kết thanh toán
					</h3>
					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium">Loại chiết khấu</label>

							<select
								className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
								{...register("discountType")}
							>
								<option value="percent">Theo phần trăm (%)</option>

								<option value="fixed">Theo số tiền (VNĐ)</option>
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Giá trị chiết khấu</label>

							<Input
								type="number"
								min="0"
								max={discountType === "percent" ? 99 : undefined}
								step={discountType === "percent" ? "1" : "1000"}
								placeholder={
									discountType === "percent" ? "Ví dụ: 10" : "Ví dụ: 20000"
								}
								{...register("discountValue", {
									valueAsNumber: true,
									min: 0,
									validate: (value) => {
										if (discountType === "percent" && value >= 100) {
											return "Chiết khấu phải nhỏ hơn 100%";
										}

										if (discountType === "fixed" && value >= subtotal) {
											return "Chiết khấu phải nhỏ hơn tạm tính";
										}

										return true;
									}
								})}
							/>

							{errors.discountValue ? (
								<p className="text-destructive text-sm">
									{errors.discountValue.message}
								</p>
							) : null}
						</div>
					</div>
				</section>

				<section className="border-border bg-card rounded-2xl border p-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Tạm tính</span>

							<span className="tabular-nums">{formatCurrency(subtotal)}</span>
						</div>

						{discountAmount > 0 ? (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Chiết khấu
									{discountType === "percent" ? ` (${discountValue}%)` : ""}
								</span>

								<span className="tabular-nums">
									-{formatCurrency(discountAmount)}
								</span>
							</div>
						) : null}

						<div className="border-border flex items-center justify-between border-t pt-3">
							<span className="font-semibold">Tổng thanh toán</span>

							<span className="text-foreground text-2xl font-bold tabular-nums">
								{formatCurrency(totalAmount)}
							</span>
						</div>
					</div>
				</section>

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" onClick={() => reset(defaultValues)}>
						Xóa form
					</Button>

					<Button
						type="submit"
						disabled={
							isSubmitting ||
							isLoadingServices ||
							!!servicesError ||
							services.length === 0
						}
					>
						{isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
					</Button>
				</div>
			</form>
			{receiptData ? (
				<div className="fixed top-0 -left-[9999px]" aria-hidden="true">
					<div ref={receiptRef}>
						<OrderReceipt data={receiptData} />
					</div>
				</div>
			) : null}
		</>
	);
}
