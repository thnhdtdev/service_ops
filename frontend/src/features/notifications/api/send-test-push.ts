import { apiFetch } from "@/lib/api/client";

type SendTestPushResponse = {
	devices: number;
	sent: number;
	removed: number;
	failed: number;
};

type ErrorResponse = {
	message?: string;
};

// Sends "Thông báo thử" to every device of the current admin.
export async function sendTestPush(): Promise<SendTestPushResponse> {
	const res = await apiFetch("/api/notifications/test", {
		method: "POST"
	});

	const data = (await res.json().catch(() => null)) as
		| SendTestPushResponse
		| ErrorResponse
		| null;

	if (!res.ok) {
		const message = data && "message" in data ? data.message : undefined;

		throw new Error(message ?? "Không thể gửi thông báo thử.");
	}

	return data as SendTestPushResponse;
}
