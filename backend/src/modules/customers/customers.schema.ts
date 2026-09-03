import {z} from "zod"

export const customerLookupSchema = z.object({
    phone: z.string().trim().min(1,"Số điện thoại không được để trống")
}) 

export const getCustomersQuerySchema = z.object({
    page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

    page_size: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(10),

    search: z.string().trim().optional()
})

export type GetCustomersQuery = z.infer<
	typeof getCustomersQuerySchema
>;
