import { createUserSupabase } from "../../lib/supabase.js";
import { normalizePhone } from "./customers.utils.js";
import { GetCustomersQuery } from "./customers.schema.js";

type FindOrCreateCustomerInput  = {
  name: string,
  phone: string,
  address?: string | null,
  note?: string | null
}

export async function findOrCreateCustomer(
  accessToken: string, 
  input:FindOrCreateCustomerInput
) {
  const supabase = createUserSupabase(accessToken);
  const normalizedPhone = normalizePhone(input.phone);

  //1. Find existing customers
  const {data: existingCustomer, error: findError} = 
    await supabase
    .from("customers")
    .select(`
      id,
      name,
      phone,
      address,
      normalized_phone,
      created_at, 
      updated_at`)
      .eq("normalized_phone", normalizedPhone)
      .maybeSingle();

       if (findError) {
        throw findError;
      }

      // 2. Customer exists → reuse, DO NOT INSERT
      if(existingCustomer){
        return {
          customer: existingCustomer,
          created: false
        }
      }

      // 3. Not found → create new customer
      const {data: newCustomer, error: createError} = 
      await supabase
      .from("customers")
      .insert({
        name: input.name,
        phone: input.phone,
        normalized_phone: normalizedPhone,
        address: input.address ?? null,
        note: input.note ?? null
      })
      .select(`
        id,
        name,
        phone,
        address,
        normalized_phone,
        note,
        created_at,
        updated_at`)
        .single()

        if(createError){
          throw createError
        }

        return{
          customer: newCustomer,
          created: true
        }
}

export async function findCustomerByPhone(
  accessToken: string,
  phone: string,
) {
  const supabase = createUserSupabase(accessToken);

  const normalizedPhone = normalizePhone(phone);

  const { data, error } = await supabase
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
    .eq("normalized_phone", normalizedPhone)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCustomers(
	accessToken: string,
	input: GetCustomersQuery
) {
	const supabase =
		createUserSupabase(accessToken);

	const from =
		(input.page - 1) * input.page_size;

	const to =
		from + input.page_size - 1;

	let query = supabase
		.from("customers")
		.select(
			`
				id,
				name,
				phone,
				normalized_phone,
				address,
				note,
				created_at,
				updated_at,
				orders (
					id,
					created_at,
					total_amount,
					payment_status,
					status
				)
			`,
			{
				count: "exact"
			}
		)
		.order("created_at", {
			ascending: false
		})
		.range(from, to);

	if (input.search) {
		const search =
			input.search.trim();

		const normalizedPhone =
			normalizePhone(search);

		query = query.or(
			[
				`name.ilike.%${search}%`,
				`phone.ilike.%${search}%`,
				normalizedPhone
					? `normalized_phone.ilike.%${normalizedPhone}%`
					: null
			]
				.filter(Boolean)
				.join(",")
		);
	}

	const monthStart = new Date();

	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);

	const [
		customersResult,
		totalCustomersResult,
		newCustomersResult
	] = await Promise.all([
		query,

		supabase
			.from("customers")
			.select("id", {
				count: "exact",
				head: true
			}),

		supabase
			.from("customers")
			.select("id", {
				count: "exact",
				head: true
			})
			.gte(
				"created_at",
				monthStart.toISOString()
			)
	]);

	if (customersResult.error) {
		throw customersResult.error;
	}

	if (totalCustomersResult.error) {
		throw totalCustomersResult.error;
	}

	if (newCustomersResult.error) {
		throw newCustomersResult.error;
	}

	const customers =
		(customersResult.data ?? []).map(
			(customer) => {
				const activeOrders =
					(customer.orders ?? []).filter(
						(order) =>
							order.status !== "cancelled"
					);

				const lastOrderAt =
					activeOrders.reduce<
						string | null
					>((latest, order) => {
						if (
							!latest ||
							order.created_at > latest
						) {
							return order.created_at;
						}

						return latest;
					}, null);

				const totalOrderValue =
					activeOrders.reduce(
						(total, order) =>
							total +
							Number(
								order.total_amount
							),
						0
					);

				return {
					id: customer.id,
					name: customer.name,
					phone: customer.phone,
					normalized_phone:
						customer.normalized_phone,
					address: customer.address,
					note: customer.note,
					created_at:
						customer.created_at,
					updated_at:
						customer.updated_at,

					order_count:
						activeOrders.length,

					unpaid_order_count:
						activeOrders.filter(
							(order) =>
								order.payment_status ===
								"unpaid"
						).length,

					last_order_at:
						lastOrderAt,

					total_order_value:
						totalOrderValue
				};
			}
		);

	const total =
		customersResult.count ?? 0;

	return {
		customers,

		stats: {
			total_customer_count:
				totalCustomersResult.count ?? 0,

			new_customer_count_this_month:
				newCustomersResult.count ?? 0
		},

		pagination: {
			page: input.page,
			page_size: input.page_size,
			total,
			total_pages: Math.ceil(
				total / input.page_size
			)
		}
	};
}

export async function getCustomerById(
  accessToken: string,
  customerId: string
) {
  const supabase = createUserSupabase(accessToken);
  
  //fetch customer by id
  const {data: customer, error: customerError} = await supabase
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
      .eq("id", customerId)
      .maybeSingle();

      if(customerError) {
        throw customerError;
      }

      if(!customer){
        return null;
      }

      const { data: orders, error: ordersError} = await supabase
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
          .eq("customer_id", customerId)
          .order("created_at", {
            ascending: false
          });

        if (ordersError) {
          throw ordersError;
        }

          const customerOrders = orders ?? [];

          if (customerOrders.length === 0) {
            return {
              customer,
              orders: [],
              stats: {
                order_count: 0,
                unpaid_order_count: 0,
                total_order_value: 0
              }
            };
          }

          const orderIds =
          customerOrders.map(
            (order) => order.id
          );

          // Fetch order items for the customer's orders
          const {data: items, error: itemError} = await supabase
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
            .in("order_id", orderIds)
            .order("created_at", {
              ascending: true
            });

            if(itemError){
              throw itemError;
            }

            //fetch payment transactions for the customer's orders
          const { data: payments, error: paymentsError} = await supabase
          .from("payments")
          .select(`
            id,
            order_id,
            amount,
            method,
            paid_at,
            created_by,
            created_at
          `)
          .in("order_id", orderIds)
          .order("paid_at", {
            ascending: false
          });

        if (paymentsError) {
          throw paymentsError;
        }

        // Group items and payments by order_id
          const ordersWithDetails = customerOrders.map((order) => ({
            ...order,

            items:
              (items ?? []).filter(
                (item) =>
                  item.order_id ===
                  order.id
              ),

            payments:
              (payments ?? []).filter(
                (payment) =>
                  payment.order_id ===
                  order.id
              )
          }));

        const activeOrders =
          customerOrders.filter(
            (order) =>
              order.status !== "cancelled"
          );

        const totalOrderValue =
          activeOrders.reduce(
            (total, order) =>
              total +
              Number(order.total_amount),
            0
          );

        const unpaidOrderCount =
          activeOrders.filter(
            (order) =>
              order.payment_status ===
              "unpaid"
          ).length;

        return {
          customer,

          orders: ordersWithDetails,

          stats: {
            order_count:
              activeOrders.length,

            unpaid_order_count:
              unpaidOrderCount,

            total_order_value:
              totalOrderValue
          }
        };
}