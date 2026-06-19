"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useActiveServices } from "@/features/services/hooks/use-active-services";
import type { CreateOrderFormValues } from "@/features/orders/type";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment-method";
import { PAYMENT_STATUS_LABEL } from "@/constants/payment-status";
import { SERVICE_UNIT_LABEL } from "@/constants/service-unit";
import { formatCurrency } from "@/lib/format";
import {
  calculateOrderLineTotal,
  calculateOrderTotal,
} from "@/features/orders/utils/calculate-order-total";
import { generateOrderCode } from "@/features/orders/utils/generate-order-code";

type CreateOrderFormProps = {
  onSuccess?: () => void;
};

const defaultValues: CreateOrderFormValues = {
  customerName: "",
  customerPhone: "",
  dueAt: "",
  note: "",
  paymentStatus: "unpaid",
  paymentMethod: "cash",
  items: [
    {
      serviceId: "",
      quantity: 1,
    },
  ],
};

export function CreateOrderForm({ onSuccess }: CreateOrderFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const {
    services,
    isLoadingServices,
    error: servicesError,
  } = useActiveServices();

  const form = useForm<CreateOrderFormValues>({
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const paymentStatus = watch("paymentStatus");


  const orderPreviewItems = useMemo(() => {
    return watchedItems
      .map((item) => {
        const service = services.find((serviceItem) => {
          return serviceItem.id === item.serviceId;
        });

        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(service?.unit_price || 0);

        return {
          service,
          quantity,
          unitPrice,
          lineTotal: calculateOrderLineTotal({
            quantity,
            unitPrice,
          }),
        };
      })
      .filter((item) => item.service && item.quantity > 0);
  }, [watchedItems, services]);

  const totalAmount = calculateOrderTotal(
    orderPreviewItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
  );

  async function onSubmit(values: CreateOrderFormValues) {
    setFormError("");

    if (values.items.length === 0) {
      setFormError("Vui lòng thêm ít nhất một dịch vụ.");
      return;
    }

    const validItems = values.items
      .map((item) => {
        const service = services.find((serviceItem) => {
          return serviceItem.id === item.serviceId;
        });

        const quantity = Number(item.quantity || 0);

        if (!service || quantity <= 0) {
          return null;
        }

        const unitPrice = Number(service.unit_price);
        const lineTotal = calculateOrderLineTotal({
          quantity,
          unitPrice,
        });

        return {
          service,
          quantity,
          unitPrice,
          lineTotal,
        };
      })
      .filter(Boolean);

    if (validItems.length === 0) {
      setFormError("Vui lòng chọn dịch vụ và nhập số lượng hợp lệ.");
      return;
    }

    if (totalAmount <= 0) {
      setFormError("Tổng tiền đơn hàng phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);

    const customerName = values.customerName.trim();
    const customerPhone = values.customerPhone.trim();

    try {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: customerName,
          phone: customerPhone || null,
        })
        .select("id")
        .single();

      if (customerError) {
        throw customerError;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_code: generateOrderCode(),
          customer_id: customer.id,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          status: "received",
          payment_status: values.paymentStatus,
          total_amount: totalAmount,
          due_at: values.dueAt ? new Date(values.dueAt).toISOString() : null,
          note: values.note.trim() || null,
        })
        .select("id")
        .single();

      if (orderError) {
        throw orderError;
      }

      const orderItemsPayload = validItems.map((item) => ({
        order_id: order.id,
        service_id: item!.service.id,
        service_name: item!.service.name,
        unit: item!.service.unit,
        quantity: item!.quantity,
        unit_price: item!.unitPrice,
        line_total: item!.lineTotal,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (orderItemsError) {
        throw orderItemsError;
      }

      if (values.paymentStatus === "paid") {
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: order.id,
          amount: totalAmount,
          method: values.paymentMethod,
          paid_at: new Date().toISOString(),
        });

        if (paymentError) {
          throw paymentError;
        }
      }

      reset(defaultValues);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setFormError("Tạo đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-semibold text-card-foreground">
          Thông tin khách hàng
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên khách hàng</label>
            <Input
              placeholder="Ví dụ: Chị Linh"
              {...register("customerName", {
                required: "Vui lòng nhập tên khách hàng",
              })}
            />
            {errors.customerName ? (
              <p className="text-sm text-destructive">
                {errors.customerName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input placeholder="Ví dụ: 0909123456" {...register("customerPhone")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-card-foreground">
              Dịch vụ
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn dịch vụ, nhập số lượng và hệ thống sẽ tự tính tiền.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ serviceId: "", quantity: 1 })}
          >
            <Plus className="mr-2 size-4" />
            Thêm dịch vụ
          </Button>
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
              unitPrice,
            });

            return (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto]"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dịch vụ</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register(`items.${index}.serviceId`, {
                      required: true,
                    })}
                  >
                    <option value="">
                      {isLoadingServices ? "Đang tải..." : "Chọn dịch vụ"}
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
                      min: 0.1,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Đơn vị</label>
                  <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
                    {selectedService
                      ? SERVICE_UNIT_LABEL[selectedService.unit]
                      : "-"}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Thành tiền</label>
                  <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm font-medium">
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

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-semibold text-card-foreground">
          Thanh toán và ghi chú
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái thanh toán</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("paymentStatus")}
            >
              <option value="unpaid">{PAYMENT_STATUS_LABEL.unpaid}</option>
              <option value="paid">{PAYMENT_STATUS_LABEL.paid}</option>
            </select>
          </div>

          {paymentStatus === "paid" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Phương thức thanh toán</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <Input placeholder="Ví dụ: Khách cần lấy trước 18h" {...register("note")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tổng tiền</span>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => reset(defaultValues)}>
          Xóa form
        </Button>

        <Button type="submit" disabled={isSubmitting || isLoadingServices}>
          {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
        </Button>
      </div>
    </form>
  );
}