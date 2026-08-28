import { apiFetch } from "@/lib/api/client";

type CurrentUserResponse = {
	user: {
		role: string;
	};
};

export async function canCurrentUserManageServices() {
	const res = await apiFetch("/api/me");

	if (!res.ok) {
		return false;
	}

	const data = (await res.json()) as CurrentUserResponse;

	return data.user.role === "admin";
}
