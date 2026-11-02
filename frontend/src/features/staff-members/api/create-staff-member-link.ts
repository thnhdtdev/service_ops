import { apiFetch } from "@/lib/api/client";

type StaffMemberLinkResponse = {
	// Raw token: only returned here, once. It is not stored anywhere.
	token: string;
	link_created_at: string;
};

type ErrorResponse = {
	message?: string;
};

// Creates a new link. If the staff member already had one, it stops working.
export async function createStaffMemberLink(id: string): Promise<StaffMemberLinkResponse> {
	const res = await apiFetch(`/api/staff-members/${id}/link`, {
		method: "POST"
	});

	const data = (await res.json().catch(() => null)) as
		| StaffMemberLinkResponse
		| ErrorResponse
		| null;

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Bạn không có quyền tạo link cho nhân viên.");
		}

		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể tạo link.");
	}

	return data as StaffMemberLinkResponse;
}
