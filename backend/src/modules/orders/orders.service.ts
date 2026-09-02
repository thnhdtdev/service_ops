import { createUserSupabase } from "../../lib/supabase.js";

import { normalizePhone } from "../customers/customers.utils.js";

import type { CreateOrderInput, GetOrdersInput } from "./orders.schema.js";

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

export async function getOrders(
	accessToken: string,
	input: GetOrdersInput
) {
	const supabase = createUserSupabase(accessToken);

	const from = (input.page - 1) * input.page_size;
	const to = from + input.page_size - 1;
	
	let query = supabase
	.from("orders")
	.select(`
		id,
		order_code,
		customer_id,
		customer_name,
		status,
		payment_status,
		total_amount,
		due_at,
		note,
		created_by,
		created_at,
		updated_at
		`,
		{
			count: "exact"
		}
	)
	.order("created_at", { ascending: false }).range(from, to);

	if (input.status) {
		query = query.eq("status", input.status);
	}
	if (input.payment_status) {
		query = query.eq("payment_status", input.payment_status);
	}

	const {data, error, count} = await query;

	if (error) {
		throw error;
	}

	const total = count ?? 0;

	return{
		orders: data ?? [],

		pagination: {
			page: input.page,
			page_size: input.page_size,
			total,
			total_pages: Math.ceil(total / input.page_size)
		}
	}
}