import { StaffDirectory } from "@/features/staff-members/components/staff-directory";
import { requireAdminPage } from "@/lib/auth/current-user";

export default async function StaffPage() {
	await requireAdminPage();

	return <StaffDirectory />;
}
