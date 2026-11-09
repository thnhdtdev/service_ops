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

// Quick search in the create order form: a name, phone digits or both,
// e.g. "yen 202". Only letters, digits and spaces: the text goes into a
// LIKE pattern in suggest_customers(), so % and _ must not get through.
export const customerSuggestQuerySchema = z.object({
	q: z
		.string()
		.trim()
		.min(2, "Nhập ít nhất 2 ký tự")
		.max(50, "Từ khóa tối đa 50 ký tự")
		.regex(/^[\p{L}\p{N} ]+$/u, "Từ khóa chỉ gồm chữ, số và khoảng trắng")
});
