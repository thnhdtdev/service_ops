import type { Metadata } from "next";

import { StaffPortal } from "@/features/staff-portal/components/staff-portal";

// Public page for one staff member, opened from their personal link.
// Not under (dashboard) and excluded from proxy.ts: no login needed.
export const metadata: Metadata = {
	title: "Lịch làm | ServiceOps",
	robots: {
		index: false,
		follow: false
	},
	referrer: "no-referrer"
};

type StaffPortalPageProps = {
	params: Promise<{
		token: string;
	}>;
};

export default async function StaffPortalPage({ params }: StaffPortalPageProps) {
	const { token } = await params;

	return <StaffPortal token={token} />;
}
