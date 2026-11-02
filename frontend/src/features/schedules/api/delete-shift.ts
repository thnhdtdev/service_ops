import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

// Also removes everyone assigned to the shift.
export async function deleteShift(id: string) {
	const res = await apiFetch(`/api/shifts/${id}`, {
		method: "DELETE"
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể xóa ca."));
	}
}
