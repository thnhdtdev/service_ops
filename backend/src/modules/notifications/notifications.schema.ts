import { z } from "zod";

// Address of the browser's push service (Apple, Google, Mozilla...).
const pushEndpointSchema = z
	.string()
	.url("Endpoint không hợp lệ")
	.startsWith("https://", "Endpoint phải dùng https")
	.max(2048, "Endpoint quá dài");

// Same shape as PushSubscription.toJSON() in the browser.
export const pushSubscriptionSchema = z.object({
	endpoint: pushEndpointSchema,

	keys: z.object({
		p256dh: z.string().min(1).max(200),
		auth: z.string().min(1).max(100)
	})
});

export const deletePushSubscriptionSchema = z.object({
	endpoint: pushEndpointSchema
});

export type PushSubscriptionInput = z.infer<
	typeof pushSubscriptionSchema
>;

// What public/sw.js receives and shows.
export type PushNotificationPayload = {
	title: string;
	body: string;
	// Page opened when the notification is tapped, e.g. "/orders/<id>".
	url: string;
	// Notifications with the same tag replace each other instead of piling up.
	tag?: string;
};
