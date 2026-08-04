import { createClient } from "@/lib/supabase/server";
import type { RevenueChartData, RevenueDataPoint } from "@/features/dashboard/types";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const PAYMENT_PAGE_SIZE = 1000;

const vietnamDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: VIETNAM_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
});

type RawPayment = {
	amount: number | string;
	paid_at: string;
};

export type RevenueChartResult = {
	data: RevenueChartData;
	error: string | null;
};

function addDays(dateKey: string, numberOfDays: number) {
	const [year, month, day] = dateKey.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day + numberOfDays));

	return date.toISOString().slice(0, 10);
}

function createEmptySeries(startDate: string, endDate: string): RevenueDataPoint[] {
	const series: RevenueDataPoint[] = [];
	let currentDate = startDate;

	while (currentDate <= endDate) {
		series.push({
			date: currentDate,
			amount: 0
		});

		currentDate = addDays(currentDate, 1);
	}

	return series;
}

function getVietnamDateKey(value: string | Date) {
	return vietnamDateFormatter.format(new Date(value));
}

function toVietnamDayBoundary(dateKey: string) {
	return new Date(`${dateKey}T00:00:00+07:00`).toISOString();
}

function applyPaymentsToSeries(series: RevenueDataPoint[], paymentsByDate: Map<string, number>) {
	return series.map((point) => ({
		...point,
		amount: paymentsByDate.get(point.date) ?? 0
	}));
}

export async function getRevenueChartData(): Promise<RevenueChartResult> {
	const today = getVietnamDateKey(new Date());
	const weekStart = addDays(today, -6);
	const monthStart = `${today.slice(0, 7)}-01`;
	const queryStart = weekStart < monthStart ? weekStart : monthStart;
	const queryEnd = addDays(today, 1);

	const emptyData: RevenueChartData = {
		week: createEmptySeries(weekStart, today),
		month: createEmptySeries(monthStart, today)
	};

	const supabase = await createClient();
	const payments: RawPayment[] = [];

	for (let from = 0; ; from += PAYMENT_PAGE_SIZE) {
		const { data, error } = await supabase
			.from("payments")
			.select("amount, paid_at")
			.gte("paid_at", toVietnamDayBoundary(queryStart))
			.lt("paid_at", toVietnamDayBoundary(queryEnd))
			.order("paid_at", { ascending: true })
			.range(from, from + PAYMENT_PAGE_SIZE - 1);

		if (error) {
			console.error("Supabase revenue chart error:", error);

			return {
				data: emptyData,
				error: "Không thể tải dữ liệu doanh thu. Vui lòng thử lại."
			};
		}

		const page = (data ?? []) as RawPayment[];
		payments.push(...page);

		if (page.length < PAYMENT_PAGE_SIZE) {
			break;
		}
	}

	const paymentsByDate = new Map<string, number>();

	for (const payment of payments) {
		const paidAt = new Date(payment.paid_at);
		const amount = Number(payment.amount);

		if (Number.isNaN(paidAt.getTime()) || !Number.isFinite(amount)) {
			continue;
		}

		const dateKey = getVietnamDateKey(paidAt);
		const currentAmount = paymentsByDate.get(dateKey) ?? 0;

		paymentsByDate.set(dateKey, currentAmount + amount);
	}

	return {
		data: {
			week: applyPaymentsToSeries(emptyData.week, paymentsByDate),
			month: applyPaymentsToSeries(emptyData.month, paymentsByDate)
		},
		error: null
	};
}
