"use client";

import {
	useCallback,
	useEffect,
	useState
} from "react";

import {
	getCustomer
} from "@/features/customers/api/get-customer";

import type {
	GetCustomerResponse
} from "@/features/customers/types";

export function useCustomer(
	customerId: string
) {
	const [reloadToken, setReloadToken] =
		useState(0);

	const requestKey =
		`${customerId}:${reloadToken}`;

	const [state, setState] = useState<{
		requestKey: string;
		data: GetCustomerResponse | null;
		error: string;
	}>({
		requestKey: "",
		data: null,
		error: ""
	});

	useEffect(() => {
		let isActive = true;

		async function loadCustomer() {
			try {
				const data =
					await getCustomer(customerId);

				if (!isActive) return;

				setState({
					requestKey,
					data,
					error: ""
				});
			} catch (error) {
				if (!isActive) return;

				setState({
					requestKey,
					data: null,
					error:
						error instanceof Error
							? error.message
							: "Không thể tải thông tin khách hàng."
				});
			}
		}

		void loadCustomer();

		return () => {
			isActive = false;
		};
	}, [customerId, requestKey]);

	const refetch = useCallback(() => {
		setReloadToken(
			(current) => current + 1
		);
	}, []);

	return {
		data: state.data,

		isLoading:
			state.requestKey !== requestKey,

		error: state.error,

		refetch
	};
}