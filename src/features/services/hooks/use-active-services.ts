"use client";

import { useEffect, useState } from "react";

import { getActiveServices } from "@/features/services/api/get-active-services";
import type { Service } from "@/features/services/types";

export function useActiveServices() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoadingServices, setIsLoadingServices] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		async function fetchServices() {
			try {
				setIsLoadingServices(true);
				setError("");

				const activeServices = await getActiveServices();

				if (!isMounted) return;

				setServices(activeServices);
			} catch (error) {
				if (!isMounted) return;

				setError(
					error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ."
				);
			} finally {
				if (!isMounted) return;

				setIsLoadingServices(false);
			}
		}

		fetchServices();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		services,
		isLoadingServices,
		error
	};
}
