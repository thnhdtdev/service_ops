import type { FastifyBaseLogger } from "fastify";
import webpush from "web-push";

import { env } from "../../config/env.js";
import { createUserSupabase } from "../../lib/supabase.js";

import type {
	PushNotificationPayload,
	PushSubscriptionInput
} from "./notifications.schema.js";
import { buildPaymentNotification } from "./notifications.utils.js";

// Every push is signed with these keys. The browser only accepts pushes
// signed with the private key that matches the public key it subscribed with.
webpush.setVapidDetails(
	env.VAPID_SUBJECT,
	env.VAPID_PUBLIC_KEY,
	env.VAPID_PRIVATE_KEY
);

// The push service keeps an undelivered message (phone off) for up to 1 day.
const PUSH_TIME_TO_LIVE_SECONDS = 60 * 60 * 24;

// 404 / 410 from the push service = the subscription no longer exists
// (notifications turned off, app removed from the home screen...).
const EXPIRED_SUBSCRIPTION_STATUS_CODES = [404, 410];

type StoredPushSubscription = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};

export type PushSendResult = {
	sent: number;
	removed: number;
	failed: number;
};

export function getVapidPublicKey() {
	return env.VAPID_PUBLIC_KEY;
}

// Saves this device for the current admin. Subscribing the same device again
// (same endpoint) updates the row instead of failing on the unique endpoint.
export async function savePushSubscription(
	accessToken: string,
	profileId: string,
	input: PushSubscriptionInput,
	userAgent: string | undefined
) {
	const supabase = createUserSupabase(accessToken);

	const { error } = await supabase
		.from("push_subscriptions")
		.upsert(
			{
				profile_id: profileId,
				endpoint: input.endpoint,
				keys: input.keys,
				user_agent: userAgent?.slice(0, 500) ?? null
			},
			{ onConflict: "endpoint" }
		);

	if (error) {
		throw error;
	}
}

// RLS only lets an admin delete their own rows.
export async function deletePushSubscription(
	accessToken: string,
	endpoint: string
) {
	const supabase = createUserSupabase(accessToken);

	const { error } = await supabase
		.from("push_subscriptions")
		.delete()
		.eq("endpoint", endpoint);

	if (error) {
		throw error;
	}
}

// Sends one notification to every device in the list, all at the same time.
// Dead subscriptions are removed. Other failures are logged and counted,
// never thrown, so one broken device does not stop the others.
async function sendPushToSubscriptions(
	accessToken: string,
	subscriptions: StoredPushSubscription[],
	payload: PushNotificationPayload,
	log: FastifyBaseLogger
): Promise<PushSendResult> {
	const supabase = createUserSupabase(accessToken);
	const result: PushSendResult = { sent: 0, removed: 0, failed: 0 };

	await Promise.all(
		subscriptions.map(async (subscription) => {
			try {
				await webpush.sendNotification(
					subscription,
					JSON.stringify(payload),
					{
						TTL: PUSH_TIME_TO_LIVE_SECONDS,
						urgency: "high"
					}
				);

				result.sent += 1;
			} catch (error) {
				const isExpired =
					error instanceof webpush.WebPushError &&
					EXPIRED_SUBSCRIPTION_STATUS_CODES.includes(error.statusCode);

				if (!isExpired) {
					result.failed += 1;
					log.warn({ err: error }, "Failed to send push notification");
					return;
				}

				const { error: deleteError } = await supabase.rpc(
					"delete_push_subscription",
					{ p_endpoint: subscription.endpoint }
				);

				if (deleteError) {
					result.failed += 1;
					log.warn(
						{ err: deleteError },
						"Failed to remove expired push subscription"
					);
					return;
				}

				result.removed += 1;
			}
		})
	);

	return result;
}

// Sends to the devices of all admins. Called right after a payment is
// recorded (the database function only allows that within 2 minutes).
export async function sendPushToAdmins(
	accessToken: string,
	payload: PushNotificationPayload,
	log: FastifyBaseLogger
) {
	const supabase = createUserSupabase(accessToken);

	const { data, error } = await supabase.rpc(
		"get_admin_push_subscriptions"
	);

	if (error) {
		throw error;
	}

	const subscriptions = (data ?? []) as StoredPushSubscription[];

	return sendPushToSubscriptions(accessToken, subscriptions, payload, log);
}

export type PaymentNotificationTarget = {
	orderId: string;
	amount: number;
	method: string;
	paymentKey: string;
};

// Called after a payment was recorded (new order paid now, or a later payment).
// Looks up the order code and customer name, then notifies all admins.
export async function sendPaymentNotification(
	accessToken: string,
	payment: PaymentNotificationTarget,
	log: FastifyBaseLogger
) {
	const supabase = createUserSupabase(accessToken);

	const { data: order, error } = await supabase
		.from("orders")
		.select("order_code, customer_name")
		.eq("id", payment.orderId)
		.single();

	if (error) {
		throw error;
	}

	const payload = buildPaymentNotification({
		...payment,
		orderCode: order.order_code,
		customerName: order.customer_name
	});

	return sendPushToAdmins(accessToken, payload, log);
}

// "Gửi thử": only to the devices of the admin who pressed the button.
export async function sendTestPush(
	accessToken: string,
	log: FastifyBaseLogger
) {
	const supabase = createUserSupabase(accessToken);

	// RLS returns only the current admin's rows.
	const { data, error } = await supabase
		.from("push_subscriptions")
		.select("endpoint, keys");

	if (error) {
		throw error;
	}

	const subscriptions = (data ?? []) as StoredPushSubscription[];

	const result = await sendPushToSubscriptions(
		accessToken,
		subscriptions,
		{
			title: "Thông báo thử",
			body: "Thông báo đẩy trên thiết bị này đang hoạt động.",
			url: "/settings",
			tag: "test"
		},
		log
	);

	return {
		devices: subscriptions.length,
		...result
	};
}
