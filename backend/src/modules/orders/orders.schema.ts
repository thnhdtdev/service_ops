import { z } from "zod";

export const createOrderSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(1),
    }),

    items: z
      .array(
        z.object({
          service_id: z.string().uuid(),
          quantity: z.number().positive(),
        }),
      )
      .min(1),

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
  });

  export const getOrdersQuerySchema  = z.object({
    page: z.coerce.number().int().positive().default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    status: z.string().trim().min(1). optional(),
    payment_status: z.enum(["unpaid", "paid"]).optional(),
  });

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;
export type GetOrdersInput = z.infer<
  typeof getOrdersQuerySchema 
>;