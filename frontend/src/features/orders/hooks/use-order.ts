"use client";

import { useCallback, useEffect, useState } from "react";

import { getOrder } from "@/features/orders/api/get-order";
import type { GetOrderResponse } from "@/features/orders/type";

export function useOrder(orderId: string) {
	const [data, setData] = useState<GetOrderResponse | null>(null);
	const [error, setError] = useState("");
	const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
	const [isRefetching, setIsRefetching] = useState(false);

	useEffect(() => {
		let ignore = false;

		getOrder(orderId)
			.then((result) => {
				if (ignore) {
					return;
				}

				setData(result);
				setError("");
				setLoadedOrderId(orderId);
			})
			.catch((error) => {
				if (ignore) {
					return;
				}

				console.error(error);

				setData(null);
				setError(
					error instanceof Error
						? error.message
						: "Không thể tải thông tin đơn hàng.",
				);
				setLoadedOrderId(orderId);
			});

		return () => {
			ignore = true;
		};
	}, [orderId]);

	const refetch = useCallback(async () => {
		setIsRefetching(true);
		setError("");

		try {
			const result = await getOrder(orderId);

			setData(result);
			setLoadedOrderId(orderId);
		} catch (error) {
			console.error(error);

			setError(
				error instanceof Error
					? error.message
					: "Không thể tải thông tin đơn hàng.",
			);
		} finally {
			setIsRefetching(false);
		}
	}, [orderId]);

	const isLoading = loadedOrderId !== orderId || isRefetching;

	return {
		data,
		isLoading,
		error,
		refetch,
	};
}