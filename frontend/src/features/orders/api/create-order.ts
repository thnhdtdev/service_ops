import { apiFetch } from "@/lib/api/client";

export type CreateOrderInput = {
	customer: {
		name: string;
		phone: string;
	};

	items: {
		service_id: string;
		quantity: number;
	}[];

	payment_status: "unpaid" | "paid";
	payment_method?: "cash" | "bank_transfer" | "other";

	due_at?: string | null;
	note?: string | null;
};

export async function createOrder(input: CreateOrderInput) {
	const response = await apiFetch("/api/orders", {
		method: "POST",
		body: JSON.stringify(input)
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Không thể tạo đơn hàng.");
	}

	return data;
}
