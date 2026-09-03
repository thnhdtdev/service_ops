import "server-only";

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function serverApiFetch(path: string, init: RequestInit = {}) {
	if (!API_URL) {
		throw new Error("NEXT_PUBLIC_API_URL is not configured.");
	}

	const supabase = await createClient();

	// Yêu cầu Supabase xác thực user trước.
	// Bước này giúp tránh dùng session/token cũ một cách mù quáng.
	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();

	if (userError || !user) {
		throw new Error("Phiên đăng nhập không hợp lệ.");
	}

	const {
		data: { session },
		error: sessionError
	} = await supabase.auth.getSession();

	if (sessionError || !session?.access_token) {
		throw new Error("Không thể lấy phiên đăng nhập.");
	}

	const headers = new Headers(init.headers);

	headers.set("Authorization", `Bearer ${session.access_token}`);

	if (init.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	return fetch(`${API_URL}${path}`, {
		...init,
		headers,
		cache: "no-store"
	});
}
