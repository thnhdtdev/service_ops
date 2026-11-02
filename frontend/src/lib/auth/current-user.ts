import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { PATHS } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

// The logged-in user and whether they are an admin, or null if not logged in.
// cache(): the layout and the page both call this during one request, but
// Supabase is only asked once.
export const getCurrentUser = cache(async () => {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	// RLS lets a user read their own profile. If the role cannot be read,
	// the user is treated as not admin.
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.maybeSingle();

	return {
		user,
		isAdmin: profile?.role === "admin"
	};
});

// Call at the top of admin-only pages. The staff account is sent back to
// the overview instead of seeing a page whose data the backend refuses.
// The real protection is still the backend (requireRole) and RLS.
export async function requireAdminPage() {
	const currentUser = await getCurrentUser();

	if (!currentUser) {
		redirect(PATHS.LOGIN);
	}

	if (!currentUser.isAdmin) {
		redirect(PATHS.HOME);
	}
}
