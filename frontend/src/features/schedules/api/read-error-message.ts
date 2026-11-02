type ErrorResponse = {
	message?: string;
};

// Turns a failed schedules API response into a Vietnamese message.
// 409 messages from the backend are already Vietnamese; other errors use
// the fallback because their backend message is technical.
export async function readErrorMessage(res: Response, fallback: string) {
	if (res.status === 403) {
		return "Chỉ tài khoản quản lý mới thực hiện được thao tác này.";
	}

	if (res.status === 409) {
		const data = (await res.json().catch(() => null)) as ErrorResponse | null;

		return data?.message ?? fallback;
	}

	return fallback;
}
