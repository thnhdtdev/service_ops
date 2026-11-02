"use client";

import { CalendarOff, CircleOff } from "lucide-react";
import Image from "next/image";

import { BusyTimesForm } from "@/features/staff-portal/components/busy-times-form";
import { MyShiftsList } from "@/features/staff-portal/components/my-shifts-list";
import { useStaffPortal } from "@/features/staff-portal/hooks/use-staff-portal";

type StaffPortalProps = {
	token: string;
};

export function StaffPortal({ token }: StaffPortalProps) {
	const { portal, isLoading, error, refetch } = useStaffPortal(token);

	return (
		<main className="bg-background min-h-dvh">
			<div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:py-10">
				<header className="flex items-center gap-3">
					<Image
						src="/favicons.png"
						alt=""
						width={40}
						height={40}
						className="size-10 shrink-0 rounded-xl shadow-sm ring-1 ring-black/5"
					/>
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs">ServiceOps · Lịch làm</p>
						<h1 className="truncate text-lg font-semibold tracking-tight">
							{portal ? `Xin chào, ${portal.staff.full_name}` : "Lịch làm của bạn"}
						</h1>
					</div>
				</header>

				{isLoading ? (
					<p role="status" className="text-muted-foreground py-16 text-center text-sm">
						Đang tải lịch...
					</p>
				) : error || !portal ? (
					<section
						role="alert"
						className="border-destructive/30 bg-destructive/5 rounded-2xl border px-5 py-10 text-center"
					>
						<div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-2xl">
							<CircleOff aria-hidden="true" strokeWidth={1.8} className="size-5" />
						</div>
						<p className="mx-auto mt-4 max-w-sm text-sm leading-6">
							{error || "Không thể tải lịch. Vui lòng thử lại."}
						</p>
					</section>
				) : (
					<>
						<MyShiftsList shifts={portal.my_shifts} />

						{portal.open_week ? (
							<BusyTimesForm
								// A new open week starts the form from its saved data.
								key={portal.open_week.week_start}
								token={token}
								week={portal.open_week}
								busyTimes={portal.busy_times}
								onSaved={refetch}
							/>
						) : (
							<section className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-4 shadow-sm">
								<CalendarOff
									aria-hidden="true"
									strokeWidth={1.8}
									className="text-muted-foreground size-5 shrink-0"
								/>
								<p className="text-muted-foreground text-sm">
									Hiện chưa có tuần nào mở nhận lịch bận.
								</p>
							</section>
						)}
					</>
				)}
			</div>
		</main>
	);
}
