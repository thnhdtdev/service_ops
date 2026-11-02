import type { ShiftTemplateInput } from "@/features/schedules/api/create-shift-template";
import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import { apiFetch } from "@/lib/api/client";

export async function updateShiftTemplate(id: string, input: ShiftTemplateInput): Promise<void> {
	const res = await apiFetch(`/api/shift-templates/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input)
	});

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể cập nhật ca mẫu."));
	}
}
