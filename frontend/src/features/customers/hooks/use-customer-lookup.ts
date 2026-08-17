"use client";

import { useEffect, useState } from "react";

import { findCustomerByPhone } from "@/features/customers/api/find-customer-by-phone";
import type { CustomerSummary } from "@/features/customers/types";
import { normalizeCustomerPhone } from "@/features/customers/utils/normalize-customer-phone";

const LOOKUP_DELAY_MS = 350;

type CustomerLookupResult = {
	phone: string;
	customer: CustomerSummary | null;
	error: string;
};

export function useCustomerLookup(phone: string) {
	const normalizedPhone = normalizeCustomerPhone(phone);
	const [result, setResult] = useState<CustomerLookupResult>({
		phone: "",
		customer: null,
		error: ""
	});

	useEffect(() => {
		if (!normalizedPhone) {
			return;
		}

		let isActive = true;

		const timeoutId = window.setTimeout(async () => {
			try {
				const customer = await findCustomerByPhone(normalizedPhone);

				if (!isActive) return;

				setResult({
					phone: normalizedPhone,
					customer,
					error: ""
				});
			} catch (error) {
				if (!isActive) return;

				setResult({
					phone: normalizedPhone,
					customer: null,
					error:
						error instanceof Error
							? error.message
							: "Không thể kiểm tra thông tin khách hàng."
				});
			}
		}, LOOKUP_DELAY_MS);

		return () => {
			isActive = false;
			window.clearTimeout(timeoutId);
		};
	}, [normalizedPhone]);

	if (!normalizedPhone) {
		return {
			customer: null,
			status: "idle" as const,
			error: ""
		};
	}

	if (result.phone !== normalizedPhone) {
		return {
			customer: null,
			status: "searching" as const,
			error: ""
		};
	}

	if (result.error) {
		return {
			customer: null,
			status: "error" as const,
			error: result.error
		};
	}

	if (result.customer) {
		return {
			customer: result.customer,
			status: "found" as const,
			error: ""
		};
	}

	return {
		customer: null,
		status: "not-found" as const,
		error: ""
	};
}
