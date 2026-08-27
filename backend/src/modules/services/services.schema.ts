import { z } from "zod"

export const createSchemaService = z.object({
    name: z
    .string()
    .trim()
    .min(1,"Tên dịch vụ không được để trống"),

    unit: z
    .string()
    .trim()
    .min(1, "Đơn vị không được để trống"),

    unit_price: z
    .number()
    .positive("Giá dịch vụ phải lớn hơn 0"),

    description: z
    .string()
    .trim()
    .nullable()
    .optional(),
})


export const updateServiceSchema = z.object({
  name: z.string().trim().min(1).optional(),
  unit: z.string().trim().min(1).optional(),
  unit_price: z.number().positive().optional(),
  description: z.string().trim().nullable().optional(),
  is_active: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
     message: "Phải có ít nhất một trường cần cập nhật",
  },
);