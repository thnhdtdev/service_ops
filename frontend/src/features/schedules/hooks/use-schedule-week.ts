"use client";

import { useCallback, useEffect, useState } from "react";

import { getScheduleWeek } from "@/features/schedules/api/get-schedule-week";
import type { ScheduleWeekDetail } from "@/features/schedules/types";

export function useScheduleWeek(weekId: string) {
	const [detail, setDetail] = useState<ScheduleWeekDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Reloads without showing the loading skeleton (keeps open dialogs mounted).
	const refetch = useCallback(async () => {
		try {
			const data = await getScheduleWeek(weekId);

			setDetail(data);
			setError("");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải lịch tuần.");
		}
	}, [weekId]);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialScheduleWeek() {
			try {
				const data = await getScheduleWeek(weekId);

				if (!isMounted) return;

				setDetail(data);
			} catch (error) {
				if (!isMounted) return;

				setError(error instanceof Error ? error.message : "Không thể tải lịch tuần.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialScheduleWeek();

		return () => {
			isMounted = false;
		};
	}, [weekId]);

	return {
		detail,
		isLoading,
		error,
		refetch
	};
}
