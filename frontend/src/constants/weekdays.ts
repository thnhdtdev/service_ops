// 1 = Monday ... 7 = Sunday (same numbering as the backend and Postgres isodow).
export const WEEKDAY_LABEL = {
	1: "Thứ 2",
	2: "Thứ 3",
	3: "Thứ 4",
	4: "Thứ 5",
	5: "Thứ 6",
	6: "Thứ 7",
	7: "Chủ nhật"
} as const;

export type Weekday = keyof typeof WEEKDAY_LABEL;
