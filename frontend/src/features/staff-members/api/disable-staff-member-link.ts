import { apiFetch } from "@/lib/api/client";

type ErrorResponse = {
	message?: string;
};

export async function disableStaffMemberLink(id: string): Promise<void> {
	const res = await apiFetch(`/api/staff-members/${id}/link`, {
		method: "DELETE"
	});

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Bạn không có quyền vô hiệu hóa link.");
		}

		const data = (await res.json().catch(() => null)) as ErrorResponse | null;

		throw new Error(data?.message ?? "Không thể vô hiệu hóa link.");
	}
}
