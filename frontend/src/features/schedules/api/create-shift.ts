import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

type CreateShiftInput = {
	shift_date: string;
	name: string;
	start_time: string;
	end_time: string;
};

export async function createShift(weekId: string, input: CreateShiftInput) {
	const res = await apiFetch(`/api/schedule-weeks/${weekId}/shifts`, {
		method: "POST",
		body: JSON.stringify(input)
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể thêm ca."));
	}
}
