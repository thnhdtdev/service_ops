export const PERIODS = [
	{ value: "today", label: "Hôm nay" },
	{ value: "this_week", label: "Tuần này" },
	{ value: "this_month", label: "Tháng này" },
	{ value: "last_week", label: "Tuần trước" },
	{ value: "last_month", label: "Tháng trước" }
] as const;

export type PeriodValue = (typeof PERIODS)[number]["value"];
