import { z } from "zod";

import {
	shiftNameSchema,
	timeOfDaySchema
} from "../schedules/schedules.schema.js";

const sortOrderSchema = z
	.number()
	.int()
	.min(0)
	.max(1000);

export const shiftTemplateParamsSchema = z.object({
	id: z
		.string()
		.uuid("ID ca mẫu không hợp lệ")
});

export const createShiftTemplateSchema = z
	.object({
		name: shiftNameSchema,

		start_time: timeOfDaySchema,

		end_time: timeOfDaySchema,

		sort_order: sortOrderSchema.optional()
	})
	.refine(
		(data) => data.end_time > data.start_time,
		{
			message: "Giờ kết thúc phải sau giờ bắt đầu",
			path: ["end_time"]
		}
	);

export const updateShiftTemplateSchema = z
	.object({
		name: shiftNameSchema.optional(),

		start_time: timeOfDaySchema.optional(),

		end_time: timeOfDaySchema.optional(),

		sort_order: sortOrderSchema.optional(),

		is_active: z
			.boolean()
			.optional()
	})
	.refine(
		(data) =>
			Object.keys(data).length > 0,
		{
			message:
				"Phải có ít nhất một trường cần cập nhật"
		}
	)
	// Times are changed together so the end > start check can run here.
	.refine(
		(data) =>
			(data.start_time === undefined) ===
			(data.end_time === undefined),
		{
			message:
				"Phải gửi cả giờ bắt đầu và giờ kết thúc",
			path: ["end_time"]
		}
	)
	.refine(
		(data) =>
			data.start_time === undefined ||
			data.end_time === undefined ||
			data.end_time > data.start_time,
		{
			message: "Giờ kết thúc phải sau giờ bắt đầu",
			path: ["end_time"]
		}
	);

export type CreateShiftTemplateInput = z.infer<
	typeof createShiftTemplateSchema
>;

export type UpdateShiftTemplateInput = z.infer<
	typeof updateShiftTemplateSchema
>;
