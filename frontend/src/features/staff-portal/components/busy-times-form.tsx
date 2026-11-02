"use client";

import { CalendarX, CircleAlert, LoaderCircle, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { WEEKDAY_LABEL } from "@/constants/weekdays";
import { formatBusyTime } from "@/features/schedules/utils/format-busy-time";
import {
	addDays,
	formatDayMonth,
	formatShiftTime,
	formatWeekRange,
	getWeekdayLabel
} from "@/features/schedules/utils/schedule-dates";
import { saveBusyTimes } from "@/features/staff-portal/api/save-busy-times";
import type { PortalBusyTime, StaffPortalData } from "@/features/staff-portal/types";
import {
	MAX_BUSY_TIME_ROWS,
	createEmptyBusyTimeRow,
	toBusyTimePayload,
	toBusyTimeRow,
	validateBusyTimeRows,
	type BusyTimeRow
} from "@/features/staff-portal/utils/busy-time-rows";
import { formatTime } from "@/lib/format";

type BusyTimesFormProps = {
	token: string;
	week: NonNullable<StaffPortalData["open_week"]>;
	busyTimes: PortalBusyTime[];
	onSaved: () => void | Promise<void>;
};

const ONE_DAY = "one_day";
const WEEKLY = "weekly";

export function BusyTimesForm({ token, week, busyTimes, onSaved }: BusyTimesFormProps) {
	const [rows, setRows] = useState<BusyTimeRow[]>(() =>
		busyTimes.map((busyTime) => toBusyTimeRow(busyTime, week.week_start))
	);
	const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
	const [submitError, setSubmitError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const { showSuccessToast } = useToast();

	const weekDays = Array.from({ length: 7 }, (_, index) => addDays(week.week_start, index));

	function updateRow(key: number, changes: Partial<BusyTimeRow>) {
		setRows((currentRows) =>
			currentRows.map((row) => (row.key === key ? { ...row, ...changes } : row))
		);
	}

	function addRow() {
		setRows((currentRows) => [...currentRows, createEmptyBusyTimeRow(week.week_start)]);
	}

	function removeRow(key: number) {
		setRows((currentRows) => currentRows.filter((row) => row.key !== key));
	}

	async function handleSave() {
		const errors = validateBusyTimeRows(rows);

		setRowErrors(errors);
		setSubmitError("");

		if (Object.keys(errors).length > 0) return;

		setIsSaving(true);

		try {
			await saveBusyTimes(token, rows.map(toBusyTimePayload));
			await onSaved();
			showSuccessToast({
				title: "Đã lưu lịch bận",
				description: "Bạn có thể sửa lại trước hạn chót."
			});
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Không thể lưu lịch bận.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<section
			aria-labelledby="busy-times-title"
			className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
		>
			<header className="border-border flex items-center gap-3 border-b px-4 py-3">
				<div className="bg-warning/10 text-warning flex size-9 shrink-0 items-center justify-center rounded-xl">
					<CalendarX aria-hidden="true" strokeWidth={1.8} className="size-4" />
				</div>
				<div>
					<h2 id="busy-times-title" className="text-base font-semibold">
						Báo lịch bận tuần {formatWeekRange(week.week_start)}
					</h2>
					<p className="text-muted-foreground text-xs">
						Hạn chót: {formatTime(week.availability_deadline)}
					</p>
				</div>
			</header>

			<div className="space-y-4 p-4">
				{week.shifts.length > 0 ? (
					<details className="border-border rounded-lg border px-3 py-2 text-sm">
						<summary className="cursor-pointer font-medium">
							Xem các ca trong tuần
						</summary>
						<ul className="mt-2 space-y-1">
							{weekDays.map((date) => {
								const dayShifts = week.shifts.filter(
									(shift) => shift.shift_date === date
								);

								return (
									<li key={date} className="flex gap-2 text-xs">
										<span className="text-muted-foreground w-24 shrink-0">
											{getWeekdayLabel(date)} {formatDayMonth(date)}
										</span>
										<span className="tabular-nums">
											{dayShifts.length > 0
												? dayShifts
														.map(
															(shift) =>
																`${shift.name} ${formatShiftTime(shift.start_time)}–${formatShiftTime(shift.end_time)}`
														)
														.join(", ")
												: "Không có ca"}
										</span>
									</li>
								);
							})}
						</ul>
					</details>
				) : null}

				{!week.can_edit ? (
					<>
						<div className="bg-muted text-muted-foreground flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm leading-5">
							<Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							<p>Đã quá hạn chót nên không sửa được lịch bận nữa.</p>
						</div>
						{busyTimes.length > 0 ? (
							<ul className="space-y-1.5 text-sm">
								{busyTimes.map((busyTime, index) => (
									<li
										key={index}
										className="border-border rounded-lg border px-3 py-2"
									>
										{formatBusyTime(busyTime)}
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground text-sm">
								Bạn không báo bận ngày nào.
							</p>
						)}
					</>
				) : (
					<>
						<p className="text-muted-foreground text-sm leading-6">
							Thêm những khoảng giờ bạn <strong>không đi làm được</strong>. Nếu tuần
							nào cũng bận cùng giờ (ví dụ đi học), chọn &quot;Hằng tuần&quot;. Nhớ
							bấm Lưu.
						</p>

						{rows.map((row, index) => (
							<fieldset
								key={row.key}
								className="border-border space-y-3 rounded-xl border p-3"
								aria-invalid={rowErrors[row.key] ? true : undefined}
							>
								<legend className="sr-only">Giờ bận {index + 1}</legend>

								<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
									<Select
										value={row.repeat_weekly ? WEEKLY : ONE_DAY}
										onValueChange={(value) =>
											updateRow(row.key, { repeat_weekly: value === WEEKLY })
										}
									>
										<SelectTrigger
											aria-label="Kiểu bận"
											className="h-10 w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={ONE_DAY}>Một ngày</SelectItem>
											<SelectItem value={WEEKLY}>Hằng tuần</SelectItem>
										</SelectContent>
									</Select>

									{row.repeat_weekly ? (
										<Select
											value={String(row.weekday)}
											onValueChange={(value) =>
												updateRow(row.key, { weekday: Number(value) })
											}
										>
											<SelectTrigger aria-label="Thứ" className="h-10 w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(WEEKDAY_LABEL).map(
													([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									) : (
										<Select
											value={row.busy_date}
											onValueChange={(value) =>
												updateRow(row.key, { busy_date: value })
											}
										>
											<SelectTrigger
												aria-label="Ngày"
												className="h-10 w-full"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{weekDays.map((date) => (
													<SelectItem key={date} value={date}>
														{getWeekdayLabel(date)}{" "}
														{formatDayMonth(date)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}

									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeRow(row.key)}
										disabled={isSaving}
										aria-label={`Xóa giờ bận ${index + 1}`}
										title="Xóa"
									>
										<Trash2 aria-hidden="true" />
									</Button>
								</div>

								<div className="flex flex-wrap items-center gap-3">
									<div className="flex items-center gap-2">
										<Switch
											id={`busy-${row.key}-whole-day`}
											checked={row.is_whole_day}
											onCheckedChange={(checked) =>
												updateRow(row.key, { is_whole_day: checked })
											}
										/>
										<Label htmlFor={`busy-${row.key}-whole-day`}>Cả ngày</Label>
									</div>

									{row.is_whole_day ? null : (
										<div className="flex items-center gap-2">
											<Input
												type="time"
												aria-label="Bận từ"
												value={row.start_time}
												onChange={(event) =>
													updateRow(row.key, {
														start_time: event.target.value
													})
												}
												className="h-10 w-28 font-mono tabular-nums"
											/>
											<span aria-hidden="true">–</span>
											<Input
												type="time"
												aria-label="Bận đến"
												value={row.end_time}
												onChange={(event) =>
													updateRow(row.key, {
														end_time: event.target.value
													})
												}
												className="h-10 w-28 font-mono tabular-nums"
											/>
										</div>
									)}
								</div>

								<Input
									aria-label="Ghi chú"
									placeholder="Ghi chú (không bắt buộc), ví dụ: đi học"
									value={row.note}
									maxLength={200}
									onChange={(event) =>
										updateRow(row.key, { note: event.target.value })
									}
									className="h-10"
								/>

								{rowErrors[row.key] ? (
									<p role="alert" className="text-destructive text-sm">
										{rowErrors[row.key]}
									</p>
								) : null}
							</fieldset>
						))}

						{rows.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								Bạn chưa báo bận. Nếu rảnh cả tuần, chỉ cần bấm Lưu.
							</p>
						) : null}

						{submitError ? (
							<div
								role="alert"
								className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
							>
								<CircleAlert
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0"
								/>
								<p>{submitError}</p>
							</div>
						) : null}

						<div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={addRow}
								disabled={isSaving || rows.length >= MAX_BUSY_TIME_ROWS}
							>
								<Plus aria-hidden="true" data-icon="inline-start" />
								Thêm giờ bận
							</Button>
							<Button type="button" onClick={handleSave} disabled={isSaving}>
								{isSaving ? (
									<LoaderCircle
										aria-hidden="true"
										className="animate-spin motion-reduce:animate-none"
									/>
								) : (
									<Save aria-hidden="true" data-icon="inline-start" />
								)}
								{isSaving ? "Đang lưu..." : "Lưu lịch bận"}
							</Button>
						</div>
					</>
				)}
			</div>
		</section>
	);
}
