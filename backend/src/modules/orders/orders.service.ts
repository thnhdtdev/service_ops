import { createUserSupabase } from "../../lib/supabase.js";

import { findOrCreateCustomer } from "../customers/customers.service.js";

import type { CreateOrderInput } from "./orders.schema.js";
import { generateOrderCode } from "./orders.utils.js";

export async function createOrder(
  accessToken: string,
  userId: string,
  input: CreateOrderInput,
) {
  const supabase = createUserSupabase(accessToken);

  // 1. Tìm khách cũ hoặc tạo khách mới
  const {
    customer,
    created: customerCreated,
  } = await findOrCreateCustomer(
    accessToken,
    input.customer,
  );

  // 2. Lấy các service từ DB
  const serviceIds = [
    ...new Set(
      input.items.map((item) => item.service_id),
    ),
  ];

  const { data: services, error: servicesError } =
    await supabase
      .from("services")
      .select(`
        id,
        name,
        unit,
        unit_price,
        is_active
      `)
      .in("id", serviceIds);

  if (servicesError) {
    throw servicesError;
  }

  const serviceMap = new Map(
    (services ?? []).map((service) => [
      service.id,
      service,
    ]),
  );

  // 3. Tạo dữ liệu order_items + tính tiền
  const orderItems = input.items.map((item) => {
    const service = serviceMap.get(
      item.service_id,
    );

    if (!service) {
      throw new Error(
        `Service not found: ${item.service_id}`,
      );
    }

    if (!service.is_active) {
      throw new Error(
        `Service "${service.name}" is inactive`,
      );
    }

    const unitPrice = Number(
      service.unit_price,
    );

    const lineTotal =
      item.quantity * unitPrice;

    return {
      service_id: service.id,
      service_name: service.name,
      unit: service.unit,
      quantity: item.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    };
  });

  const totalAmount = orderItems.reduce(
    (total, item) =>
      total + item.line_total,
    0,
  );

  // 4. Tạo order
  const { data: order, error: orderError } =
    await supabase
      .from("orders")
      .insert({
        order_code: generateOrderCode(),

        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,

        status: "received",
        payment_status:
          input.payment_status,

        total_amount: totalAmount,

        due_at: input.due_at ?? null,
        note: input.note ?? null,

        created_by: userId,
      })
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
      .single();

  if (orderError) {
    throw orderError;
  }

  // 5. Tạo order_items
  const { data: createdItems, error: itemsError } =
    await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          ...item,
        })),
      )
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
      `);

  if (itemsError) {
    throw itemsError;
  }

  // 6. Nếu khách đã thanh toán thì tạo payment
  if (input.payment_status === "paid") {
    const { error: paymentError } =
      await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          amount: totalAmount,
          method: input.payment_method!,
          paid_at: new Date().toISOString(),
          created_by: userId,
        });

    if (paymentError) {
      throw paymentError;
    }
  }

  return {
    order,
    items: createdItems ?? [],
    customer,
    customer_created: customerCreated,
  };
}