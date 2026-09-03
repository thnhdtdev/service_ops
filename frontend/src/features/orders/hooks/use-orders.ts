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
	const queryKey = [page, pageSize, status ?? "", paymentStatus ?? ""].join(":");
	const requestKey = [queryKey, reloadToken].join(":");
	const [state, setState] = useState<{
		queryKey: string;
		requestKey: string;
		orders: OrderListItem[];
		pagination: OrdersPagination | null;
		error: string;
	}>({
		queryKey: "",
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
					queryKey,
					requestKey,
					orders: data.orders,
					pagination: data.pagination,
					error: ""
				});
			} catch (error) {
				if (!isActive) return;

				setState({
					queryKey,
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
	}, [page, pageSize, paymentStatus, queryKey, requestKey, status]);

	const refetch = useCallback(() => {
		setReloadToken((currentToken) => currentToken + 1);
	}, []);

	return {
		orders: state.orders,
		pagination: state.pagination,
		isLoading: state.queryKey !== queryKey,
		error: state.error,
		refetch
	};
}
