import { z } from "zod";
import { customerPhoneSchema } from "../customers/customers.schema.js";

  export const orderStatusSchema = z.enum([
    "received",
    "processing",
    "completed",
    "delivered",
    "cancelled"
  ]);

export const createOrderSchema = z.object({
    customer: z.object({
      name: z.string().trim().min(1),
      phone: customerPhoneSchema,
    }),

    items: z
      .array(
        z.object({
          service_id: z.string().uuid(),
          quantity: z.number().positive(),
        }),
      )
      .min(1),

    discount_type: z
      .enum(["percent", "fixed"])
      .nullable()
      .optional(),

    discount_value: z
      .number()
      .min(0)
      .optional()
      .default(0),

    payment_status: z.enum(["unpaid", "paid"]),

    payment_method: z
      .enum(["cash", "bank_transfer", "other"])
      .optional(),

    due_at: z.string().datetime().nullable().optional(),

    note: z.string().trim().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.payment_status === "paid" &&
      !data.payment_method
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["payment_method"],
        message:
          "Phải chọn phương thức thanh toán khi đơn đã thanh toán",
      });
    }

    if (
      data.discount_value === 0 &&
      data.discount_type != null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_type"],
        message:
          "Không được chọn loại chiết khấu khi giá trị chiết khấu bằng 0",
      });
    }

    if (
      data.discount_value > 0 &&
      data.discount_type == null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_type"],
        message:
          "Phải chọn loại chiết khấu khi giá trị chiết khấu lớn hơn 0",
      });
    }

    if (
      data.discount_type === "percent" &&
      data.discount_value > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_value"],
        message:
          "Chiết khấu phần trăm không được lớn hơn 100%",
      });
    }
  });

  export const getOrdersQuerySchema  = z.object({
    page: z.coerce.number().int().positive().default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    status: orderStatusSchema.optional(),
    payment_status: z.enum(["unpaid", "paid"]).optional(),
  });

  export const getOrderParamsSchema = z.object({
	    id: z.string().uuid()
  });

  export const markOrderPaidSchema = z.object({
    payment_method: z.enum(["cash", "bank_transfer", "other"])
  });



export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;

export type GetOrdersInput = z.infer<
  typeof getOrdersQuerySchema 
>;

export type GetOrderParams = z.infer<
  typeof getOrderParamsSchema
>;

export type MarkOrderPaidInput = z.infer<
  typeof markOrderPaidSchema
>;