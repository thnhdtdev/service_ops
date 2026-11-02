import type { StaffMember } from "@/features/staff-members/types";
import { apiFetch } from "@/lib/api/client";

type StaffMembersResponse = {
	staff_members: StaffMember[];
};

export async function getStaffMembers(): Promise<StaffMember[]> {
	const res = await apiFetch("/api/staff-members");

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Chỉ tài khoản quản lý mới xem được danh sách nhân viên.");
		}

		throw new Error("Không thể tải danh sách nhân viên.");
	}

	const data = (await res.json()) as StaffMembersResponse;
	return data.staff_members;
}
