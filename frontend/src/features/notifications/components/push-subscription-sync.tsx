"use client";

import { useEffect } from "react";

import { savePushSubscription } from "@/features/notifications/api/save-push-subscription";
import { isPushSupported } from "@/features/notifications/utils/push-support";

// Mounted once in the dashboard for admins. Each time the app opens, it sends
// this device's subscription to the backend again, so the database stays in
// sync if the browser renewed the subscription.
// It never subscribes on its own: after "Tắt thông báo" the permission is
// still "granted", and the device must stay off.
export function PushSubscriptionSync() {
	useEffect(() => {
		async function syncSubscription() {
			if (!isPushSupported() || Notification.permission !== "granted") return;

			const registration = await navigator.serviceWorker.getRegistration("/");
			const subscription = await registration?.pushManager.getSubscription();

			if (subscription) {
				await savePushSubscription(subscription);
			}
		}

		syncSubscription().catch(() => {
			// Not important: it is tried again the next time the app opens.
		});
	}, []);

	return null;
}
