"use client";

import { useCallback, useEffect, useState } from "react";

import { getOrder } from "@/features/orders/api/get-order";
import type { GetOrderResponse } from "@/features/orders/type";

export function useOrder(orderId: string) {
	const [data, setData] = useState<GetOrderResponse | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	const [error, setError] = useState("");

	const loadOrder = useCallback(async () => {
		setIsLoading(true);
		setError("");

		try {
			const result = await getOrder(orderId);

			setData(result);
		} catch (error) {
			console.error(error);

			setError(error instanceof Error ? error.message : "Không thể tải thông tin đơn hàng.");
		} finally {
			setIsLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		void loadOrder();
	}, [loadOrder]);

	return {
		data,
		isLoading,
		error,
		refetch: loadOrder
	};
}
