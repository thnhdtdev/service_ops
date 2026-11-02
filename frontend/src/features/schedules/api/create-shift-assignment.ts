import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

export async function createShiftAssignment(shiftId: string, staffMemberId: string) {
	const res = await apiFetch(`/api/shifts/${shiftId}/assignments`, {
		method: "POST",
		body: JSON.stringify({
			staff_member_id: staffMemberId
		})
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể xếp nhân viên vào ca."));
	}
}
