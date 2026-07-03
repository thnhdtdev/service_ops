export const PERIODS = [
	{ value: "today", label: "Today" },
	{ value: "this_week", label: "This Week" },
	{ value: "this_month", label: "This Month" },
	{ value: "last_week", label: "Last Week" },
	{ value: "last_month", label: "Last Month" }
] as const;

export type PeriodValue = (typeof PERIODS)[number]["value"];
