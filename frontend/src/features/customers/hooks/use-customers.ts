"use client";

import { useCallback, useEffect, useState } from "react";

import { getCustomers } from "@/features/customers/api/get-customers";

import type {
	CustomerListItem,
	CustomersPagination,
	GetCustomersParams
} from "@/features/customers/types";

type CustomerStats = {
	total_customer_count: number;
	new_customer_count_this_month: number;
};

export function useCustomers({ page = 1, pageSize = 10, search }: GetCustomersParams = {}) {
	const [reloadToken, setReloadToken] = useState(0);

	const requestKey = [page, pageSize, search ?? "", reloadToken].join(":");

	const [state, setState] = useState<{
		requestKey: string;
		customers: CustomerListItem[];
		stats: CustomerStats | null;
		pagination: CustomersPagination | null;
		error: string;
	}>({
		requestKey: "",
		customers: [],
		stats: null,
		pagination: null,
		error: ""
	});

	useEffect(() => {
		let isActive = true;

		async function loadCustomers() {
			try {
				const data = await getCustomers({
					page,
					pageSize,
					search
				});

				if (!isActive) return;

				setState({
					requestKey,
					customers: data.customers,
					stats: data.stats,
					pagination: data.pagination,
					error: ""
				});
			} catch (error) {
				if (!isActive) return;

				setState({
					requestKey,
					customers: [],
					stats: null,
					pagination: null,
					error:
						error instanceof Error
							? error.message
							: "Không thể tải danh sách khách hàng."
				});
			}
		}

		void loadCustomers();

		return () => {
			isActive = false;
		};
	}, [page, pageSize, search, requestKey]);

	const refetch = useCallback(() => {
		setReloadToken((current) => current + 1);
	}, []);

	return {
		customers: state.customers,
		stats: state.stats,
		pagination: state.pagination,

		isLoading: state.requestKey !== requestKey,

		error: state.error,

		refetch
	};
}
