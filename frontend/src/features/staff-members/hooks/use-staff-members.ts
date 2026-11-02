"use client";

import { useCallback, useEffect, useState } from "react";

import { getStaffMembers } from "@/features/staff-members/api/get-staff-members";
import type { StaffMember } from "@/features/staff-members/types";

export function useStaffMembers() {
	const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	// Reloads without showing the loading skeleton, so an open dialog
	// (e.g. the one showing a new link) is not unmounted.
	const refetch = useCallback(async () => {
		try {
			const data = await getStaffMembers();

			setStaffMembers(data);
			setError("");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tải danh sách nhân viên.");
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function loadInitialStaffMembers() {
			try {
				const data = await getStaffMembers();

				if (!isMounted) return;

				setStaffMembers(data);
			} catch (error) {
				if (!isMounted) return;

				setError(
					error instanceof Error ? error.message : "Không thể tải danh sách nhân viên."
				);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadInitialStaffMembers();

		return () => {
			isMounted = false;
		};
	}, []);

	return {
		staffMembers,
		isLoading,
		error,
		refetch
	};
}
