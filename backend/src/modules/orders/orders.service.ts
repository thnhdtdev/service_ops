import { createUserSupabase } from "../../lib/supabase.js";

import { normalizePhone } from "../customers/customers.utils.js";

import type { CreateOrderInput, GetOrdersInput, MarkOrderPaidInput } from "./orders.schema.js";

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
	.select(
	`
		id,
		order_code,
		customer_id,
		customer_name,
		customer_phone,
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

export async function getOrderDetail(
	accessToken: string,
	orderId: string
) {
	const supabase = createUserSupabase(accessToken);

	//fetch order
	const {data: order, error: orderError} = await supabase
	.from("orders")
	.select(`
			id,
			order_code,
			customer_id,
			customer_name,
			customer_phone,
			status,
			payment_status,
			total_amount,
			due_at,
			note,
			created_by,
			created_at,
			updated_at
		`)
		.eq("id", orderId)
		.maybeSingle();

		if (orderError) {
			throw orderError;
		}

		if (!order) {
			return null;
		}

	//fetch order items
	const {data: items, error: itemsError} = await supabase
	.from("order_items")
	.select(`
			id,
			order_id,
			service_id,
			service_name,
			unit,
			quantity,
			unit_price,
			line_total,
			note,
			created_at
		`)
		.eq("order_id", orderId)
		.order("created_at", {ascending: true});

		if( itemsError) {
			throw itemsError;
		}

		//fetch order payments
		const {data: payments, error: paymentsError} = await supabase
		.from("payments")
		.select(`
				id,
				order_id,
				amount,
				method,
				paid_at,
				created_by,
				created_at
			`).eq("order_id", orderId)
			.order("paid_at", {ascending: true});

		if (paymentsError) {
			throw paymentsError;
		}

		//fetch customer
		let customer = null;
		if (order.customer_id) {
			const {
				data: customerData,
				error: customerError
			} = await supabase
				.from("customers")
				.select(`
					id,
					name,
					phone,
					normalized_phone,
					address,
					note,
					created_at,
					updated_at
				`)
				.eq(
					"id",
					order.customer_id
				)
				.maybeSingle();

			if (customerError) {
				throw customerError;
			}

			customer = customerData;
		}

		return{
			order,
			items: items ?? [],
			payments: payments ?? [],
			customer
		}	
}

export async function markOrderPaid(
	accessToken: string,
	orderId: string,
	input: MarkOrderPaidInput
){
	const supabase = createUserSupabase(accessToken);

	const {data, error} = await supabase.rpc("mark_order_paid_transaction", {
		p_order_id: orderId,
		p_payment_method: input.payment_method
	});

	if(error){
		throw error;
	}

	if(!data){
		throw new Error("Payment operation returned no data");
	}
	return data;
}