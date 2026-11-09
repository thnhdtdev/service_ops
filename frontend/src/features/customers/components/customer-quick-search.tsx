"use client";

import { LoaderCircle, Search, UserPlus } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { useCustomerSuggestions } from "@/features/customers/hooks/use-customer-suggestions";
import type { CustomerSuggestion } from "@/features/customers/types";
import { cn } from "@/lib/utils";

export type NewCustomerDraft = {
	name: string;
	phone: string;
};

type CustomerQuickSearchProps = {
	onSelect: (customer: CustomerSuggestion) => void;
	// "Khách mới": what was typed, split into name and phone digits.
	onCreateNew: (draft: NewCustomerDraft) => void;
};

// "Yến 202" -> { name: "Yến", phone: "202" }
function splitDraft(query: string): NewCustomerDraft {
	const words = query.split(" ").filter(Boolean);

	return {
		name: words.filter((word) => !/^\d+$/.test(word)).join(" "),
		phone: words.filter((word) => /^\d+$/.test(word)).join("")
	};
}

// "0901234202" -> "0901 234 202"
function formatPhone(phone: string | null) {
	if (!phone) return "Chưa có SĐT";

	return /^\d{10}$/.test(phone)
		? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`
		: phone;
}

// Helps tell apart two customers with the same name.
function formatLastVisit(value: string | null) {
	if (!value) return "Chưa có đơn";

	const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);

	if (days <= 0) return "Hôm nay";
	if (days === 1) return "Hôm qua";
	if (days < 30) return `${days} ngày trước`;

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "Asia/Ho_Chi_Minh"
	}).format(new Date(value));
}

export function CustomerQuickSearch({ onSelect, onCreateNew }: CustomerQuickSearchProps) {
	const [text, setText] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const { query, canSearch, isSearching, customers, error } = useCustomerSuggestions(text);
	const listId = useId();

	// The options are the customers, then "Khách mới" as the last one.
	const optionCount = customers.length + 1;
	const currentIndex = Math.min(activeIndex, optionCount - 1);
	const showList = isOpen && canSearch;
	const draft = splitDraft(query);

	function getOptionId(index: number) {
		return `${listId}-option-${index}`;
	}

	function choose(index: number) {
		const customer = customers[index];

		if (customer) {
			onSelect(customer);
		} else {
			onCreateNew(draft);
		}

		setText("");
		setIsOpen(false);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			setIsOpen(false);
			return;
		}

		if (!canSearch) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setIsOpen(true);
			setActiveIndex((index) => (Math.min(index, optionCount - 1) + 1) % optionCount);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setIsOpen(true);
			setActiveIndex(
				(index) => (Math.min(index, optionCount - 1) - 1 + optionCount) % optionCount
			);
		} else if (event.key === "Enter") {
			// Enter picks an option instead of submitting the whole order form.
			event.preventDefault();

			// While loading, the list is not final yet: do not pick "Khách mới" by mistake.
			if (showList && !isSearching) choose(currentIndex);
		}
	}

	return (
		<div className="relative">
			<Search
				aria-hidden="true"
				className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
			/>
			<Input
				id="customer-quick-search"
				type="search"
				role="combobox"
				aria-expanded={showList}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={
					showList && !isSearching ? getOptionId(currentIndex) : undefined
				}
				autoComplete="off"
				placeholder="Ví dụ: Yến 202"
				value={text}
				onChange={(event) => {
					setText(event.target.value);
					setActiveIndex(0);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => setIsOpen(false)}
				onKeyDown={handleKeyDown}
				className="h-10 pl-9"
			/>

			{showList ? (
				<ul
					id={listId}
					role="listbox"
					aria-label="Khách hàng phù hợp"
					className="border-border bg-popover text-popover-foreground absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border p-1 shadow-lg"
				>
					{isSearching ? (
						<li
							role="presentation"
							className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm"
						>
							<LoaderCircle
								aria-hidden="true"
								className="size-4 animate-spin motion-reduce:animate-none"
							/>
							Đang tìm khách...
						</li>
					) : null}

					{error ? (
						<li role="presentation" className="text-destructive px-3 py-2 text-sm">
							{error}
						</li>
					) : null}

					{customers.map((customer, index) => (
						<li
							key={customer.id}
							id={getOptionId(index)}
							role="option"
							aria-selected={currentIndex === index}
							// mousedown would blur the input and close the list before the click.
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => choose(index)}
							onMouseEnter={() => setActiveIndex(index)}
							className={cn(
								"flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2",
								currentIndex === index && "bg-muted"
							)}
						>
							<span className="min-w-0">
								<span className="block truncate text-sm font-medium">
									{customer.name}
								</span>
								<span className="text-muted-foreground block font-mono text-xs tabular-nums">
									{formatPhone(customer.phone)}
								</span>
							</span>
							<span className="text-muted-foreground shrink-0 text-xs">
								{formatLastVisit(customer.last_order_at)}
							</span>
						</li>
					))}

					{!isSearching ? (
						<li
							id={getOptionId(customers.length)}
							role="option"
							aria-selected={currentIndex === customers.length}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => choose(customers.length)}
							onMouseEnter={() => setActiveIndex(customers.length)}
							className={cn(
								"text-primary flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
								currentIndex === customers.length && "bg-muted"
							)}
						>
							<UserPlus aria-hidden="true" className="size-4 shrink-0" />
							<span className="min-w-0 truncate">
								{customers.length === 0 ? "Không thấy khách. " : ""}
								Tạo khách mới
								{draft.name || draft.phone
									? `: ${[draft.name, draft.phone].filter(Boolean).join(" · ")}`
									: ""}
							</span>
						</li>
					) : null}
				</ul>
			) : null}
		</div>
	);
}
