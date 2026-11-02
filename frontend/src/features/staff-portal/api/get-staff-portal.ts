import { readStaffPortalError } from "@/features/staff-portal/api/read-staff-portal-error";
import type { StaffPortalData } from "@/features/staff-portal/types";
import { staffPortalFetch } from "@/lib/api/public";

export async function getStaffPortal(token: string): Promise<StaffPortalData> {
	const res = await staffPortalFetch("/api/staff-portal", token);

	if (!res.ok) {
		throw new Error(await readStaffPortalError(res, "Không thể tải lịch. Vui lòng thử lại."));
	}

	return (await res.json()) as StaffPortalData;
}
