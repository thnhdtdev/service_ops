// Service worker: runs in the background, even when the app is closed.
// It only handles push notifications (no offline cache).
// Plain JavaScript: files in public/ are served as they are, not compiled.

// A new version of this file takes over right away instead of waiting
// until every open tab of the app is closed.
self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

// Message sent by the backend: { title, body, url, tag }.
self.addEventListener("push", (event) => {
	let data = {};

	try {
		data = event.data ? event.data.json() : {};
	} catch {
		data = { body: event.data ? event.data.text() : "" };
	}

	// Every push must show a notification: iOS cancels the subscription
	// of an app that receives pushes without showing anything.
	event.waitUntil(
		self.registration.showNotification(data.title || "ServiceOps", {
			body: data.body || "",
			icon: "/icon-192.png",
			badge: "/icon-192.png",
			tag: data.tag,
			data: { url: data.url || "/" }
		})
	);
});

// Tapping the notification opens the page from the message (e.g. the order).
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const targetUrl = getSameOriginUrl(event.notification.data && event.notification.data.url);

	event.waitUntil(openOrFocusApp(targetUrl));
});

// Only pages of this app may be opened, never another website.
function getSameOriginUrl(path) {
	try {
		const url = new URL(path || "/", self.location.origin);

		return url.origin === self.location.origin ? url.href : self.location.origin + "/";
	} catch {
		return self.location.origin + "/";
	}
}

// Reuse an open window of the app if there is one, otherwise open a new one.
async function openOrFocusApp(targetUrl) {
	const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

	for (const client of windows) {
		if (new URL(client.url).origin !== self.location.origin) continue;

		try {
			const focused = await client.focus();

			await focused.navigate(targetUrl);

			return;
		} catch {
			// navigate() fails for a window this worker does not control yet:
			// fall back to opening a new window below.
			break;
		}
	}

	await self.clients.openWindow(targetUrl);
}
