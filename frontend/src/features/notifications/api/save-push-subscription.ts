import { apiFetch } from "@/lib/api/client";

// Saves this device on the backend. Sending the same device again only
// updates it (the backend upserts by endpoint).
export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
	const res = await apiFetch("/api/notifications/subscriptions", {
		method: "POST",
		// toJSON() gives { endpoint, keys: { p256dh, auth } }.
		body: JSON.stringify(subscription.toJSON())
	});

	if (!res.ok) {
		throw new Error("Không thể lưu thiết bị nhận thông báo.");
	}
}
