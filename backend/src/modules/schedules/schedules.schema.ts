import { z } from "zod";

import { getIsoWeekday } from "./schedules.utils.js";

// "HH:MM" from 00:00 to 23:59, plus 24:00 for the end of a day.
export const timeOfDaySchema = z
	.string()
	.regex(
		/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/,
		"Giờ phải có dạng HH:MM"
	);

export const shiftNameSchema = z
	.string()
	.trim()
	.min(1, "Tên ca không được để trống")
	.max(50, "Tên ca tối đa 50 ký tự");

const deadlineSchema = z
	.string()
	.datetime({
		offset: true,
		message: "Hạn chót không hợp lệ"
	});

export const scheduleWeekParamsSchema = z.object({
	id: z
		.string()
		.uuid("ID tuần không hợp lệ")
});

export const shiftParamsSchema = z.object({
	id: z
		.string()
		.uuid("ID ca không hợp lệ")
});

export const shiftAssignmentParamsSchema = z.object({
	id: z
		.string()
		.uuid("ID ca không hợp lệ"),

	staffMemberId: z
		.string()
		.uuid("ID nhân viên không hợp lệ")
});

export const createScheduleWeekSchema = z.object({
	week_start: z
		.string()
		.date("Ngày bắt đầu tuần không hợp lệ")
		.refine(
			(date) => getIsoWeekday(date) === 1,
			"Tuần phải bắt đầu vào thứ Hai"
		),

	availability_deadline: deadlineSchema
});

export const updateScheduleWeekSchema = z
	.object({
		availability_deadline: deadlineSchema.optional(),

		status: z
			.enum(["open", "published"])
			.optional()
	})
	.refine(
		(data) =>
			Object.keys(data).length > 0,
		{
			message:
				"Phải có ít nhất một trường cần cập nhật"
		}
	);

export const createShiftSchema = z
	.object({
		shift_date: z
			.string()
			.date("Ngày của ca không hợp lệ"),

		name: shiftNameSchema,

		start_time: timeOfDaySchema,

		end_time: timeOfDaySchema
	})
	.refine(
		// "HH:MM" strings compare correctly as text.
		(data) => data.end_time > data.start_time,
		{
			message: "Giờ kết thúc phải sau giờ bắt đầu",
			path: ["end_time"]
		}
	);

export const createShiftAssignmentSchema = z.object({
	staff_member_id: z
		.string()
		.uuid("ID nhân viên không hợp lệ")
});

export type CreateScheduleWeekInput = z.infer<
	typeof createScheduleWeekSchema
>;

export type UpdateScheduleWeekInput = z.infer<
	typeof updateScheduleWeekSchema
>;

export type CreateShiftInput = z.infer<
	typeof createShiftSchema
>;
