"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATHS } from "@/constants/routes";

type OrderSearchFormProps = {
	defaultValue?: string;
};

// Keeps only what the backend accepts (letters, digits, spaces, "-"),
// so a typed "SB-0311,26" still searches instead of failing.
function cleanSearch(value: string) {
	return value
		.replace(/[^\p{L}\p{N} -]/gu, "")
		.trim()
		.slice(0, 50);
}

// Opens the orders page filtered by the search text: /orders?search=...
export function OrderSearchForm({ defaultValue = "" }: OrderSearchFormProps) {
	const router = useRouter();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const search = cleanSearch(String(formData.get("search") ?? ""));

		router.push(search ? `${PATHS.ORDERS}?search=${encodeURIComponent(search)}` : PATHS.ORDERS);
	}

	return (
		<form role="search" onSubmit={handleSubmit} className="flex gap-2">
			<div className="relative min-w-0 flex-1">
				<Search
					aria-hidden="true"
					className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
				/>
				<Input
					name="search"
					type="search"
					defaultValue={defaultValue}
					maxLength={50}
					placeholder="Mã đơn, SĐT hoặc tên khách"
					aria-label="Tìm đơn hàng"
					className="h-10 pl-9"
				/>
			</div>
			<Button type="submit" variant="outline" className="h-10">
				Tìm
			</Button>
		</form>
	);
}
