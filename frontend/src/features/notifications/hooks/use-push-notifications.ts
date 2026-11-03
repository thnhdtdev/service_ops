"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";
import { deletePushSubscription } from "@/features/notifications/api/delete-push-subscription";
import { getPushPublicKey } from "@/features/notifications/api/get-push-public-key";
import { savePushSubscription } from "@/features/notifications/api/save-push-subscription";
import { sendTestPush } from "@/features/notifications/api/send-test-push";
import {
	base64UrlToBytes,
	getServiceWorkerRegistration,
	isIos,
	isPushSupported,
	isStandalone
} from "@/features/notifications/utils/push-support";

// checking:      reading the browser state (first render)
// needs-install: iPhone in a Safari tab, must be added to the home screen first
// unsupported:   this browser has no Web Push
// denied:        the user blocked notifications for this app
// off / on:      no subscription / subscribed on this device
export type PushStatus = "checking" | "needs-install" | "unsupported" | "denied" | "off" | "on";

async function getCurrentSubscription() {
	const registration = await navigator.serviceWorker.getRegistration("/");

	return (await registration?.pushManager.getSubscription()) ?? null;
}

async function getCurrentPushStatus(): Promise<PushStatus> {
	if (isIos() && !isStandalone()) return "needs-install";

	if (!isPushSupported()) return "unsupported";

	if (Notification.permission === "denied") return "denied";

	const subscription = await getCurrentSubscription();

	return subscription ? "on" : "off";
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

export function usePushNotifications() {
	const [status, setStatus] = useState<PushStatus>("checking");
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const { showSuccessToast } = useToast();

	useEffect(() => {
		let isMounted = true;

		getCurrentPushStatus()
			.then((nextStatus) => {
				if (isMounted) setStatus(nextStatus);
			})
			.catch(() => {
				if (isMounted) setStatus("unsupported");
			});

		return () => {
			isMounted = false;
		};
	}, []);

	async function enable() {
		setIsWorking(true);
		setError("");

		try {
			// Must be the first await of the tap: iOS only shows the permission
			// prompt as a direct response to the user pressing the button.
			const permission = await Notification.requestPermission();

			if (permission !== "granted") {
				setStatus(permission === "denied" ? "denied" : "off");
				return;
			}

			const registration = await getServiceWorkerRegistration();

			// Reuse the subscription if this device already has one.
			let subscription = await registration.pushManager.getSubscription();

			if (!subscription) {
				const publicKey = await getPushPublicKey();

				subscription = await registration.pushManager.subscribe({
					// Every push shows a notification (required by browsers).
					userVisibleOnly: true,
					applicationServerKey: base64UrlToBytes(publicKey)
				});
			}

			await savePushSubscription(subscription);

			setStatus("on");
			showSuccessToast({
				title: "Đã bật thông báo",
				description: "Thiết bị này sẽ nhận thông báo khi có thanh toán."
			});
		} catch (error) {
			setError(getErrorMessage(error, "Không thể bật thông báo lúc này."));
		} finally {
			setIsWorking(false);
		}
	}

	async function disable() {
		setIsWorking(true);
		setError("");

		try {
			const subscription = await getCurrentSubscription();

			if (subscription) {
				await deletePushSubscription(subscription.endpoint);
				await subscription.unsubscribe();
			}

			setStatus("off");
			showSuccessToast({
				title: "Đã tắt thông báo",
				description: "Thiết bị này sẽ không nhận thông báo thanh toán nữa."
			});
		} catch (error) {
			setError(getErrorMessage(error, "Không thể tắt thông báo lúc này."));
		} finally {
			setIsWorking(false);
		}
	}

	async function sendTest() {
		setIsWorking(true);
		setError("");

		try {
			const result = await sendTestPush();

			showSuccessToast({
				title: "Đã gửi thông báo thử",
				description: `Đã gửi tới ${result.sent} thiết bị của bạn.`
			});
		} catch (error) {
			setError(getErrorMessage(error, "Không thể gửi thông báo thử."));
		} finally {
			setIsWorking(false);
		}
	}

	return { status, isWorking, error, enable, disable, sendTest };
}
