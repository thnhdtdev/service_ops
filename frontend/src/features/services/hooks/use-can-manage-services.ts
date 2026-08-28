"use client";

import { useEffect, useState } from "react";

import { canCurrentUserManageServices } from "@/features/services/api/get-service-permissions";

export function useCanManageServices() {
	const [canManageServices, setCanManageServices] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadPermission() {
			try {
				const canManage = await canCurrentUserManageServices();

				if (isMounted) {
					setCanManageServices(canManage);
				}
			} catch {
				if (isMounted) {
					setCanManageServices(false);
				}
			}
		}

		void loadPermission();

		return () => {
			isMounted = false;
		};
	}, []);

	return canManageServices;
}
