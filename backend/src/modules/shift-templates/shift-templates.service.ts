import { createUserSupabase } from "../../lib/supabase.js";

import type {
	CreateShiftTemplateInput,
	UpdateShiftTemplateInput
} from "./shift-templates.schema.js";

const SHIFT_TEMPLATE_COLUMNS = `
	id,
	name,
	start_time,
	end_time,
	sort_order,
	is_active,
	created_at
`;

export async function getShiftTemplates(accessToken: string) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("shift_templates")
		.select(SHIFT_TEMPLATE_COLUMNS)
		.order("sort_order", { ascending: true })
		.order("start_time", { ascending: true });

	if (error) {
		throw error;
	}

	return data ?? [];
}

export async function createShiftTemplate(
	accessToken: string,
	input: CreateShiftTemplateInput
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("shift_templates")
		.insert({
			name: input.name,
			start_time: input.start_time,
			end_time: input.end_time,
			sort_order: input.sort_order ?? 0
		})
		.select(SHIFT_TEMPLATE_COLUMNS)
		.single();

	if (error) {
		throw error;
	}

	return data;
}

export async function updateShiftTemplate(
	accessToken: string,
	id: string,
	input: UpdateShiftTemplateInput
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase
		.from("shift_templates")
		.update(input)
		.eq("id", id)
		.select(SHIFT_TEMPLATE_COLUMNS)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}
