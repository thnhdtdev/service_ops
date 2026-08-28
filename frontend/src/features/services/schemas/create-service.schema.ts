import { z } from "zod";

export const createServiceSchema = z.object({
	name: z.string().trim().min(1, "Vui lòng nhập tên dịch vụ"),
	unit: z.enum(["kg", "pair", "piece", "set"]),
	unit_price: z.number().positive("Đơn giá phải lớn hơn 0"),
	description: z.string().trim()
});

export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
