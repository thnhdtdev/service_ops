const API_URL = process.env.NEXT_PUBLIC_API_URL;

// For the public staff link page (no login). Called from the browser so the
// backend rate limit counts each staff member's own IP.
// The token goes in a header, not in the URL, so it is not written to the
// backend request logs.
export async function staffPortalFetch(path: string, token: string, options: RequestInit = {}) {
	const headers = new Headers(options.headers);

	headers.set("X-Staff-Token", token);

	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	return fetch(`${API_URL}${path}`, {
		...options,
		headers,
		cache: "no-store",
		referrerPolicy: "no-referrer"
	});
}
