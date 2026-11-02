import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

export type ShiftTemplateInput = {
	name: string;
	start_time: string;
	end_time: string;
	sort_order: number;
	is_active?: boolean;
};

export async function createShiftTemplate(input: ShiftTemplateInput): Promise<void> {
	const res = await apiFetch("/api/shift-templates", {
		method: "POST",
		body: JSON.stringify({
			name: input.name,
			start_time: input.start_time,
			end_time: input.end_time,
			sort_order: input.sort_order
		})
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể thêm ca mẫu."));
	}
}
