import { createUserSupabase } from "../../lib/supabase.js";

import type {
	CreateStaffMemberInput,
	UpdateStaffMemberInput
} from "./staff-members.schema.js";
import {
	generateStaffLinkToken,
	hashStaffLinkToken
} from "./staff-members.utils.js";

// link_token_hash is never selected: the API only says whether a link
// exists (link_created_at is null when there is no link).
const STAFF_MEMBER_COLUMNS = `
	id,
	full_name,
	phone,
	is_active,
	link_created_at,
	created_at,
	updated_at
`;

export async function getStaffMembers(accessToken: string) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("staff_members")
		.select(STAFF_MEMBER_COLUMNS)
		.order("is_active", { ascending: false })
		.order("full_name", { ascending: true });

	if (error) {
		throw error;
	}

	return data ?? [];
}

export async function createStaffMember(
	accessToken: string,
	input: CreateStaffMemberInput
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("staff_members")
		.insert({
			full_name: input.full_name,
			phone: input.phone ?? null
		})
		.select(STAFF_MEMBER_COLUMNS)
		.single();

	if (error) {
		throw error;
	}

	return data;
}

export async function updateStaffMember(
	accessToken: string,
	id: string,
	input: UpdateStaffMemberInput
) {
	const supabase = createUserSupabase(accessToken);

	const changes: Record<string, unknown> = {
		...input,
		updated_at: new Date().toISOString()
	};

	// A deactivated staff member must not keep a working link.
	if (input.is_active === false) {
		changes.link_token_hash = null;
		changes.link_created_at = null;
	}

	const { data, error } = await supabase
		.from("staff_members")
		.update(changes)
		.eq("id", id)
		.select(STAFF_MEMBER_COLUMNS)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}

// Creates a new link (or replaces the old one, which stops working).
// The raw token is returned once and never stored.
export async function createStaffMemberLink(
	accessToken: string,
	id: string
) {
	const supabase = createUserSupabase(accessToken);

	const token = generateStaffLinkToken();
	const now = new Date().toISOString();

	const { data, error } = await supabase
		.from("staff_members")
		.update({
			link_token_hash: hashStaffLinkToken(token),
			link_created_at: now,
			updated_at: now
		})
		.eq("id", id)
		.eq("is_active", true)
		.select("link_created_at")
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (!data) {
		return null;
	}

	return {
		token,
		link_created_at: data.link_created_at
	};
}

export async function disableStaffMemberLink(
	accessToken: string,
	id: string
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("staff_members")
		.update({
			link_token_hash: null,
			link_created_at: null,
			updated_at: new Date().toISOString()
		})
		.eq("id", id)
		.select(STAFF_MEMBER_COLUMNS)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}
