import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

export async function deleteShiftAssignment(shiftId: string, staffMemberId: string) {
	const res = await apiFetch(`/api/shifts/${shiftId}/assignments/${staffMemberId}`, {
		method: "DELETE"
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể bỏ nhân viên khỏi ca."));
	}
}
