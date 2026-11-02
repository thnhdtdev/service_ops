"use client";

import { useCallback, useEffect, useState } from "react";

import { getScheduleWeeks } from "@/features/schedules/api/get-schedule-weeks";
import type { ScheduleWeek } from "@/features/schedules/types";

export function useScheduleWeeks() {
	const [scheduleWeeks, setScheduleWeeks] = useState<ScheduleWeek[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Reloads without showing the loading skeleton (keeps open dialogs mounted).
	const refetch = useCallback(async () => {
		try {
			const data = await getScheduleWeeks();

			setScheduleWeeks(data);
			setError("");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải danh sách tuần.");
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialScheduleWeeks() {
			try {
				const data = await getScheduleWeeks();

				if (!isMounted) return;

				setScheduleWeeks(data);
			} catch (error) {
				if (!isMounted) return;

				setError(error instanceof Error ? error.message : "Không thể tải danh sách tuần.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialScheduleWeeks();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		scheduleWeeks,
		isLoading,
		error,
		refetch
	};
}
