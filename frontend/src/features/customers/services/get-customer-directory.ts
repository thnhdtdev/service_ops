import { createClient } from "@/lib/supabase/server";
import type { CustomerDirectory, CustomerDirectoryItem } from "@/features/customers/types";
import { getCustomerPhoneLookupValues } from "@/features/customers/utils/normalize-customer-phone";

const CUSTOMER_LIST_LIMIT = 50;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

type RawCustomerOrder = {
	id: string;
	created_at: string;
	total_amount: number | string;
	payment_status: string;
	status: string;
};

type RawCustomer = {
	id: string;
	name: string;
	phone: string | null;
	created_at: string;
	orders: RawCustomerOrder[] | null;
};

function sanitizeSearchQuery(value: string) {
	return value
		.trim()
		.replace(/[,%()*]/g, " ")
		.replace(/\s+/g, " ")
		.slice(0, 60);
}

function getVietnamMonthStart() {
	const monthKey = new Intl.DateTimeFormat("en-CA", {
		timeZone: VIETNAM_TIME_ZONE,
		year: "numeric",
		month: "2-digit"
	}).format(new Date());

	return new Date(`${monthKey}-01T00:00:00+07:00`).toISOString();
}

function toDirectoryItem(customer: RawCustomer): CustomerDirectoryItem {
	const activeOrders = (customer.orders ?? []).filter((order) => order.status !== "cancelled");
	let lastOrderAt: string | null = null;

	for (const order of activeOrders) {
		if (!lastOrderAt || order.created_at > lastOrderAt) {
			lastOrderAt = order.created_at;
		}
	}

	return {
		id: customer.id,
		name: customer.name,
		phone: customer.phone,
		createdAt: customer.created_at,
		orderCount: activeOrders.length,
		unpaidOrderCount: activeOrders.filter((order) => order.payment_status === "unpaid").length,
		lastOrderAt,
		totalOrderValue: activeOrders.reduce((total, order) => {
			const orderValue = Number(order.total_amount);

			return Number.isFinite(orderValue) ? total + orderValue : total;
		}, 0)
	};
}

export async function getCustomerDirectory(searchQuery = ""): Promise<CustomerDirectory> {
	const supabase = await createClient();
	const query = sanitizeSearchQuery(searchQuery);

	let customersQuery = supabase
		.from("customers")
		.select(
			`
				id,
				name,
				phone,
				created_at,
				orders (
					id,
					created_at,
					total_amount,
					payment_status,
					status
				)
			`,
			{ count: "exact" }
		)
		.order("created_at", { ascending: false })
		.limit(CUSTOMER_LIST_LIMIT);

	if (query) {
		const phoneDigits = query.replace(/\D/g, "");
		const phoneValues = getCustomerPhoneLookupValues(query);
		const phoneFilters = new Set<string>();

		if (phoneDigits) {
			phoneFilters.add(`phone.ilike.%${phoneDigits}%`);
		}

		for (const phoneValue of phoneValues) {
			phoneFilters.add(`phone.ilike.%${phoneValue}%`);
		}

		customersQuery = customersQuery.or([`name.ilike.%${query}%`, ...phoneFilters].join(","));
	}

	const [customersResult, totalCustomersResult, newCustomersResult] = await Promise.all([
		customersQuery,
		supabase.from("customers").select("id", { count: "exact", head: true }),
		supabase
			.from("customers")
			.select("id", { count: "exact", head: true })
			.gte("created_at", getVietnamMonthStart())
	]);

	if (customersResult.error) {
		console.error("Supabase customer directory error:", customersResult.error);
		throw new Error("Không thể tải danh sách khách hàng.");
	}

	if (totalCustomersResult.error) {
		console.error("Supabase customer count error:", totalCustomersResult.error);
		throw new Error("Không thể tải tổng số khách hàng.");
	}

	if (newCustomersResult.error) {
		console.error("Supabase new customer count error:", newCustomersResult.error);
		throw new Error("Không thể tải số khách hàng mới.");
	}

	const customers = ((customersResult.data ?? []) as RawCustomer[]).map(toDirectoryItem);
	const matchingCustomerCount = customersResult.count ?? customers.length;

	return {
		customers,
		matchingCustomerCount,
		totalCustomerCount: totalCustomersResult.count ?? 0,
		newCustomerCountThisMonth: newCustomersResult.count ?? 0,
		isLimited: matchingCustomerCount > CUSTOMER_LIST_LIMIT
	};
}
