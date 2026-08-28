"use client";

import { useCallback, useEffect, useState } from "react";

import { getServices } from "@/features/services/api/get-services";
import type { Service } from "@/features/services/types";

export function useServices() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const loadServices = useCallback(async () => {
		try {
			setIsLoading(true);
			setError("");

			const data = await getServices();

			setServices(data);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialServices() {
			try {
				const data = await getServices();

				if (!isMounted) return;

				setServices(data);
			} catch (error) {
				if (!isMounted) return;

				setError(
					error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ."
				);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialServices();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		services,
		isLoading,
		error,
		refetch: loadServices
	};
}
