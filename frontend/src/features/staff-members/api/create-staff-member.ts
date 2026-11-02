import type { StaffMember, StaffMemberInput } from "@/features/staff-members/types";
import { apiFetch } from "@/lib/api/client";

type StaffMemberResponse = {
	staff_member: StaffMember;
};

type ErrorResponse = {
	message?: string;
};

export async function createStaffMember(input: StaffMemberInput): Promise<StaffMember> {
	const res = await apiFetch("/api/staff-members", {
		method: "POST",
		body: JSON.stringify({
			full_name: input.full_name,
			phone: input.phone
		})
	});

	const data = (await res.json().catch(() => null)) as StaffMemberResponse | ErrorResponse | null;

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Bạn không có quyền thêm nhân viên.");
		}

		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể thêm nhân viên.");
	}

	return (data as StaffMemberResponse).staff_member;
}
