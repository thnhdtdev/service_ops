// Browser checks used before turning on push notifications.
// Only call these in the browser (inside useEffect or event handlers).

export function isPushSupported() {
	return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// iPhone, or iPad (which reports itself as a Mac but has a touch screen).
export function isIos() {
	const userAgent = navigator.userAgent;

	return (
		/iPhone|iPad|iPod/.test(userAgent) ||
		(userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
	);
}

// Opened from the home screen (full screen) instead of a Safari tab.
// navigator.standalone only exists on iOS, so it is not in the Navigator type.
export function isStandalone() {
	const iosNavigator = navigator as Navigator & { standalone?: boolean };

	return (
		window.matchMedia("(display-mode: standalone)").matches || iosNavigator.standalone === true
	);
}

// The VAPID public key is base64url text; subscribe() wants raw bytes.
export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
	const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4))
		.replace(/-/g, "+")
		.replace(/_/g, "/");
	const binary = window.atob(base64);
	const bytes = new Uint8Array(new ArrayBuffer(binary.length));

	for (let index = 0; index < binary.length; index++) {
		bytes[index] = binary.charCodeAt(index);
	}

	return bytes;
}

// Registers public/sw.js (does nothing if it is already registered) and
// waits until it is active, which pushManager needs.
export async function getServiceWorkerRegistration() {
	await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });

	return navigator.serviceWorker.ready;
}
