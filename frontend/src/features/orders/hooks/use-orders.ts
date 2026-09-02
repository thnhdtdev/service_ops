"use client";

import { useCallback, useEffect, useState } from "react";

import { getOrders } from "@/features/orders/api/get-orders";

import type { GetOrdersParams, OrderListItem, OrdersPagination } from "@/features/orders/type";

export function useOrders({
	page = 1,
	pageSize = 20,
	status,
	paymentStatus
}: GetOrdersParams = {}) {
	const [reloadToken, setReloadToken] = useState(0);
	const requestKey = [page, pageSize, status ?? "", paymentStatus ?? "", reloadToken].join(":");
	const [state, setState] = useState<{
		requestKey: string;
		orders: OrderListItem[];
		pagination: OrdersPagination | null;
		error: string;
	}>({
		requestKey: "",
		orders: [],
		pagination: null,
		error: ""
	});

	useEffect(() => {
		let isActive = true;

		async function loadOrders() {
			try {
				const data = await getOrders({
					page,
					pageSize,
					status,
					paymentStatus
				});

				if (!isActive) return;

				setState({
					requestKey,
					orders: data.orders,
					pagination: data.pagination,
					error: ""
				});
			} catch (error) {
				if (!isActive) return;

				setState({
					requestKey,
					orders: [],
					pagination: null,
					error:
						error instanceof Error ? error.message : "Không thể tải danh sách đơn hàng."
				});
			}
		}

		void loadOrders();

		return () => {
			isActive = false;
		};
	}, [page, pageSize, paymentStatus, requestKey, status]);

	const refetch = useCallback(() => {
		setReloadToken((currentToken) => currentToken + 1);
	}, []);

	return {
		orders: state.orders,
		pagination: state.pagination,
		isLoading: state.requestKey !== requestKey,
		error: state.error,
		refetch
	};
}
