"use client";

import { useCallback, useEffect, useState } from "react";

import { getShiftTemplates } from "@/features/schedules/api/get-shift-templates";
import type { ShiftTemplate } from "@/features/schedules/types";

export function useShiftTemplates() {
	const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Reloads without showing the loading skeleton (keeps open dialogs mounted).
	const refetch = useCallback(async () => {
		try {
			const data = await getShiftTemplates();

			setShiftTemplates(data);
			setError("");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải danh sách ca mẫu.");
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialShiftTemplates() {
			try {
				const data = await getShiftTemplates();

				if (!isMounted) return;

				setShiftTemplates(data);
			} catch (error) {
				if (!isMounted) return;

				setError(
					error instanceof Error ? error.message : "Không thể tải danh sách ca mẫu."
				);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialShiftTemplates();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		shiftTemplates,
		isLoading,
		error,
		refetch
	};
}
