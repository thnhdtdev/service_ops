import {z} from "zod"

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