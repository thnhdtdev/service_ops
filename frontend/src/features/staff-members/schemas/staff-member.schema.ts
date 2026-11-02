import { z } from "zod";

export const staffMemberSchema = z.object({
	full_name: z
		.string()
		.trim()
		.min(1, "Vui lòng nhập tên nhân viên")
		.max(100, "Tên nhân viên tối đa 100 ký tự"),
	// Optional: empty, or 10 digits starting with 0 (same rule as the backend).
	phone: z
		.string()
		.trim()
		.refine(
			(value) => value === "" || /^0\d{9}$/.test(value),
			"Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"
		),
	is_active: z.boolean()
});

export type StaffMemberSchema = z.infer<typeof staffMemberSchema>;
