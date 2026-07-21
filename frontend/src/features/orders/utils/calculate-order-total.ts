export type CalculateOrderItem = {
	quantity: number;
	unitPrice: number;
};
export function calculateOrderLineTotal(item: CalculateOrderItem) {
	return item.quantity * item.unitPrice;
}

export function calculateOrderTotal(items: CalculateOrderItem[]) {
	return items.reduce((total, item) => {
		return total + calculateOrderLineTotal(item);
	}, 0);
}
