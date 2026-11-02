type ErrorResponse = {
	message?: string;
};

export async function readStaffPortalError(res: Response, fallback: string) {
	if (res.status === 404) {
		return "Link không hợp lệ hoặc đã bị vô hiệu hóa. Hãy liên hệ quản lý để nhận link mới.";
	}

	if (res.status === 429) {
		return "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.";
	}

	// 409: no open week / deadline passed. The backend message is Vietnamese.
	if (res.status === 409) {
		const data = (await res.json().catch(() => null)) as ErrorResponse | null;

		return data?.message ?? fallback;
	}

	if (res.status === 400) {
		return "Lịch bận chưa hợp lệ. Hãy kiểm tra lại ngày và giờ.";
	}

	return fallback;
}
