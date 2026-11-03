import { apiFetch } from "@/lib/api/client";

export async function deletePushSubscription(endpoint: string): Promise<void> {
	const res = await apiFetch("/api/notifications/subscriptions", {
		method: "DELETE",
		body: JSON.stringify({ endpoint })
	});

	if (!res.ok) {
		throw new Error("Không thể tắt thông báo lúc này.");
	}
}
