import { createUserSupabase } from "../../lib/supabase.js";

import { normalizePhone } from "../customers/customers.utils.js";

import type { CreateOrderInput } from "./orders.schema.js";

export async function createOrder(
	accessToken: string,
	input: CreateOrderInput
) {
	const supabase =
		createUserSupabase(accessToken);

	const normalizedPhone =
		normalizePhone(input.customer.phone);

	if (!normalizedPhone) {
		throw new Error(
			"Invalid customer phone"
		);
	}

	const { data, error } =
		await supabase.rpc(
			"create_order_transaction",
			{
				p_customer_name:
					input.customer.name,

				p_customer_phone:
					input.customer.phone,

				p_normalized_phone:
					normalizedPhone,

				p_due_at:
					input.due_at ?? null,

				p_note:
					input.note ?? null,

				p_payment_status:
					input.payment_status,

				p_payment_method:
					input.payment_method ?? null,

				p_items:
					input.items
			}
		);

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error(
			"Order creation returned no data"
		);
	}

	return data;
}