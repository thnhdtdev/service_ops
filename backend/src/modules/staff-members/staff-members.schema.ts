import { z } from "zod";

import { customerPhoneSchema } from "../customers/customers.schema.js";

const staffFullNameSchema = z
	.string()
	.trim()
	.min(1, "Tên nhân viên không được để trống")
	.max(100, "Tên nhân viên tối đa 100 ký tự");

export const staffMemberParamsSchema = z.object({
	id: z
		.string()
		.uuid("ID nhân viên không hợp lệ")
});

export const createStaffMemberSchema = z.object({
	full_name: staffFullNameSchema,

	phone: customerPhoneSchema
		.nullable()
		.optional()
});

export const updateStaffMemberSchema = z
	.object({
		full_name: staffFullNameSchema.optional(),

		phone: customerPhoneSchema
			.nullable()
			.optional(),

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
	);

export type CreateStaffMemberInput = z.infer<
	typeof createStaffMemberSchema
>;

export type UpdateStaffMemberInput = z.infer<
	typeof updateStaffMemberSchema
>;
