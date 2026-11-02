import type { StaffMember, StaffMemberInput } from "@/features/staff-members/types";
import { apiFetch } from "@/lib/api/client";

type StaffMemberResponse = {
	staff_member: StaffMember;
};

type ErrorResponse = {
	message?: string;
};

export async function updateStaffMember(id: string, input: StaffMemberInput): Promise<StaffMember> {
	const res = await apiFetch(`/api/staff-members/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input)
	});

	const data = (await res.json().catch(() => null)) as StaffMemberResponse | ErrorResponse | null;

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Bạn không có quyền cập nhật nhân viên.");
		}

		if (res.status === 404) {
			throw new Error("Nhân viên không còn tồn tại.");
		}

		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể cập nhật nhân viên.");
	}

	return (data as StaffMemberResponse).staff_member;
}
