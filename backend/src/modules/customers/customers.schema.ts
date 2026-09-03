import {z} from "zod"


export const customerPhoneSchema = z
    .string()
    .trim()
    .regex(
        /^0\d{9}$/,
        "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0"
);

export const customerLookupSchema = z.object({
    phone: customerPhoneSchema
});

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

export const getCustomerParamsSchema = z.object({
	id: z.string().uuid()
});

export type GetCustomersQuery = z.infer<
	typeof getCustomersQuerySchema
>;

export type GetCustomerParams = z.infer<
	typeof getCustomerParamsSchema
>;
