export function generateOrderCode() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const random = crypto.randomUUID().slice(0, 8).toUpperCase();

	return `SO-${year}${month}${day}-${random}`;
}
