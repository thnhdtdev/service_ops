// Staff link pages have no login, so these calls use the anon client.
// The database functions are SECURITY DEFINER: they check the token
// and only return or change that staff member's data.
import { supabase } from "../../lib/supabase.js";

import type { SaveBusyTimesInput } from "./staff-portal.schema.js";

export async function getStaffPortal(token: string) {
	const { data, error } = await supabase.rpc("staff_portal_get", {
		p_token: token
	});

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Staff portal returned no data");
	}

	return data;
}

export async function saveStaffBusyTimes(
	token: string,
	input: SaveBusyTimesInput
) {
	const { data, error } = await supabase.rpc(
		"staff_portal_save_busy_times",
		{
			p_token: token,
			p_items: input.busy_times
		}
	);

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Saving busy times returned no data");
	}

	return data;
}
