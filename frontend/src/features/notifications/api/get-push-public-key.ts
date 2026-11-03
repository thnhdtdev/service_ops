import { apiFetch } from "@/lib/api/client";

type PublicKeyResponse = {
	public_key: string;
};

// VAPID public key: the browser needs it to create a push subscription.
export async function getPushPublicKey(): Promise<string> {
	const res = await apiFetch("/api/notifications/public-key");

	if (!res.ok) {
		if (res.status === 403) {
			throw new Error("Chỉ quản lý mới bật được thông báo.");
		}

		throw new Error("Không thể bật thông báo lúc này.");
	}

	const data = (await res.json()) as PublicKeyResponse;

	return data.public_key;
}
