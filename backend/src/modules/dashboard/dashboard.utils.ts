const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const vietnamDateFormatter =
	new Intl.DateTimeFormat("en-CA", {
		timeZone: VIETNAM_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});

export function getVietnamTodayRange() {
	const now = new Date();

	const vietnamDate =
		vietnamDateFormatter.format(now);

	const start = new Date(
		`${vietnamDate}T00:00:00+07:00`
	);

	const end = new Date(start);

	end.setDate(
		end.getDate() + 1
	);

	return {
		start: start.toISOString(),
		end: end.toISOString()
	};
}

export function getVietnamDateKey(
	value: string | Date
) {
	return vietnamDateFormatter.format(
		new Date(value)
	);
}

export function addDays(
	dateKey: string,
	numberOfDays: number
) {
	const [year, month, day] =
		dateKey
			.split("-")
			.map(Number);

	const date = new Date(
		Date.UTC(
			year,
			month - 1,
			day + numberOfDays
		)
	);

	return date
		.toISOString()
		.slice(0, 10);
}

export function toVietnamDayBoundary(
	dateKey: string
) {
	return new Date(
		`${dateKey}T00:00:00+07:00`
	).toISOString();
}