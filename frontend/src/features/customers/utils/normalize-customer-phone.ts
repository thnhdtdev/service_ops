const VIETNAM_LOCAL_PHONE_PATTERN = /^0\d{9}$/;
const VIETNAM_COUNTRY_CODE_PHONE_PATTERN = /^84\d{9}$/;

// normalizeCustomerPhone đưa các dạng 0912345678, 84912345678 và +84912345678
// về cùng một định dạng để tìm kiếm và lưu trữ nhất quán.
export function normalizeCustomerPhone(value: string) {
	const compactPhone = value.trim().replace(/[\s.-]/g, "");
	const phoneWithoutPlus = compactPhone.startsWith("+") ? compactPhone.slice(1) : compactPhone;

	if (VIETNAM_LOCAL_PHONE_PATTERN.test(phoneWithoutPlus)) {
		return phoneWithoutPlus;
	}

	if (VIETNAM_COUNTRY_CODE_PHONE_PATTERN.test(phoneWithoutPlus)) {
		return `0${phoneWithoutPlus.slice(2)}`;
	}

	return null;
}

// Dữ liệu cũ có thể đang lưu ở dạng 0xxx, 84xxx hoặc +84xxx.
// Tìm cả ba dạng giúp nhận diện khách cũ trước khi dữ liệu được chuẩn hóa hoàn toàn.
export function getCustomerPhoneLookupValues(value: string) {
	const normalizedPhone = normalizeCustomerPhone(value);

	if (!normalizedPhone) {
		return [];
	}

	const internationalPhone = `84${normalizedPhone.slice(1)}`;

	return [normalizedPhone, internationalPhone, `+${internationalPhone}`];
}
