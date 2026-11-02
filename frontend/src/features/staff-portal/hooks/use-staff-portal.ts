"use client";

import { useCallback, useEffect, useState } from "react";

import { getStaffPortal } from "@/features/staff-portal/api/get-staff-portal";
import type { StaffPortalData } from "@/features/staff-portal/types";

export function useStaffPortal(token: string) {
	const [portal, setPortal] = useState<StaffPortalData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Reloads without showing the loading state, so the form stays on screen.
	const refetch = useCallback(async () => {
		try {
			const data = await getStaffPortal(token);

			setPortal(data);
			setError("");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải lịch.");
		}
	}, [token]);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialPortal() {
			try {
				const data = await getStaffPortal(token);

				if (!isMounted) return;

				setPortal(data);
			} catch (error) {
				if (!isMounted) return;

				setError(error instanceof Error ? error.message : "Không thể tải lịch.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialPortal();

		return () => {
			isMounted = false;
		};
	}, [token]);

	return {
		portal,
		isLoading,
		error,
		refetch
	};
}
