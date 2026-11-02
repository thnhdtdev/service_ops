import { z } from "zod";

import { getIsoWeekday } from "@/features/schedules/utils/schedule-dates";

const shiftNameSchema = z
	.string()
	.trim()
	.min(1, "Vui lòng nhập tên ca")
	.max(50, "Tên ca tối đa 50 ký tự");

// Value of <input type="time">: "HH:MM"
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Vui lòng chọn giờ");

// Value of <input type="datetime-local">: "YYYY-MM-DDTHH:MM"
const deadlineSchema = z.string().min(1, "Vui lòng chọn hạn chót");

export const shiftTemplateSchema = z
	.object({
		name: shiftNameSchema,
		start_time: timeSchema,
		end_time: timeSchema,
		sort_order: z.number().int().min(0, "Thứ tự không được âm").max(1000),
		is_active: z.boolean()
	})
	.refine((data) => data.end_time > data.start_time, {
		message: "Giờ kết thúc phải sau giờ bắt đầu",
		path: ["end_time"]
	});

export const shiftSchema = z
	.object({
		name: shiftNameSchema,
		start_time: timeSchema,
		end_time: timeSchema
	})
	.refine((data) => data.end_time > data.start_time, {
		message: "Giờ kết thúc phải sau giờ bắt đầu",
		path: ["end_time"]
	});

export const createScheduleWeekSchema = z.object({
	week_start: z
		.string()
		.min(1, "Vui lòng chọn ngày bắt đầu tuần")
		.refine((date) => getIsoWeekday(date) === 1, "Tuần phải bắt đầu vào thứ Hai"),
	availability_deadline: deadlineSchema
});

export const scheduleDeadlineSchema = z.object({
	availability_deadline: deadlineSchema
});

export type ShiftTemplateSchema = z.infer<typeof shiftTemplateSchema>;
export type ShiftSchema = z.infer<typeof shiftSchema>;
export type CreateScheduleWeekSchema = z.infer<typeof createScheduleWeekSchema>;
export type ScheduleDeadlineSchema = z.infer<typeof scheduleDeadlineSchema>;
