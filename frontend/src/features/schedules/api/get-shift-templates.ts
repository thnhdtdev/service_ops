import { readErrorMessage } from "@/features/schedules/api/read-error-message";
import type { ShiftTemplate } from "@/features/schedules/types";
import { apiFetch } from "@/lib/api/client";

type ShiftTemplatesResponse = {
	shift_templates: ShiftTemplate[];
};

export async function getShiftTemplates(): Promise<ShiftTemplate[]> {
	const res = await apiFetch("/api/shift-templates");

	if (!res.ok) {
		throw new Error(await readErrorMessage(res, "Không thể tải danh sách ca mẫu."));
	}

	const data = (await res.json()) as ShiftTemplatesResponse;
	return data.shift_templates;
}
