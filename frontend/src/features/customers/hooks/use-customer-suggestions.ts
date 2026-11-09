"use client";

import { useEffect, useState } from "react";

import { suggestCustomers } from "@/features/customers/api/suggest-customers";
import type { CustomerSuggestion } from "@/features/customers/types";

// Waits until the user stops typing before asking the backend.
const SUGGEST_DELAY_MS = 250;

// Same characters the backend accepts: letters, digits and spaces.
export function cleanCustomerQuery(value: string) {
	return value
		.replace(/[^\p{L}\p{N} ]/gu, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 50);
}

type SuggestionsResult = {
	query: string;
	customers: CustomerSuggestion[];
	error: string;
};

export function useCustomerSuggestions(text: string) {
	const query = cleanCustomerQuery(text);
	const canSearch = query.length >= 2;
	const [result, setResult] = useState<SuggestionsResult>({
		query: "",
		customers: [],
		error: ""
	});

	useEffect(() => {
		if (!canSearch) return;

		let isActive = true;

		const timeoutId = window.setTimeout(async () => {
			try {
				const customers = await suggestCustomers(query);

				if (isActive) setResult({ query, customers, error: "" });
			} catch (error) {
				if (!isActive) return;

				setResult({
					query,
					customers: [],
					error: error instanceof Error ? error.message : "Không thể tìm khách hàng."
				});
			}
		}, SUGGEST_DELAY_MS);

		// A newer keystroke cancels this search: old results never replace new ones.
		return () => {
			isActive = false;
			window.clearTimeout(timeoutId);
		};
	}, [canSearch, query]);

	// The result belongs to an older query while the new one is loading.
	const isCurrent = canSearch && result.query === query;

	return {
		query,
		canSearch,
		isSearching: canSearch && !isCurrent,
		customers: isCurrent ? result.customers : [],
		error: isCurrent ? result.error : ""
	};
}
