import { z } from "zod";

import { timeOfDaySchema } from "../schedules/schedules.schema.js";
import { STAFF_LINK_TOKEN_PATTERN } from "../staff-members/staff-members.utils.js";

// Value of the X-Staff-Token header.
export const staffPortalTokenSchema = z
	.string()
	.regex(STAFF_LINK_TOKEN_PATTERN);

const busyNoteSchema = z
	.string()
	.trim()
	.max(200, "Ghi chú tối đa 200 ký tự")
	.nullable()
	.optional();

const weeklyBusyTimeSchema = z
	.object({
		repeat_weekly: z.literal(true),

		// 1 = Monday ... 7 = Sunday
		weekday: z
			.number()
			.int()
			.min(1)
			.max(7),

		start_time: timeOfDaySchema,

		end_time: timeOfDaySchema,

		note: busyNoteSchema
	})
	.refine(
		(data) => data.end_time > data.start_time,
		{
			message: "Giờ kết thúc phải sau giờ bắt đầu",
			path: ["end_time"]
		}
	);

const oneDayBusyTimeSchema = z
	.object({
		repeat_weekly: z.literal(false),

		busy_date: z
			.string()
			.date("Ngày bận không hợp lệ"),

		start_time: timeOfDaySchema,

		end_time: timeOfDaySchema,

		note: busyNoteSchema
	})
	.refine(
		(data) => data.end_time > data.start_time,
		{
			message: "Giờ kết thúc phải sau giờ bắt đầu",
			path: ["end_time"]
		}
	);

export const saveBusyTimesSchema = z.object({
	busy_times: z
		.array(
			z.discriminatedUnion("repeat_weekly", [
				weeklyBusyTimeSchema,
				oneDayBusyTimeSchema
			])
		)
		.max(50, "Tối đa 50 khoảng giờ bận")
});

export type SaveBusyTimesInput = z.infer<
	typeof saveBusyTimesSchema
>;
