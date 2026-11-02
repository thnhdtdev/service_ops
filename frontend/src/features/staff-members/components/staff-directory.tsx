"use client";

import { CircleCheck, CircleOff, Link2, Link2Off, RotateCcw, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffLinkDialog } from "@/features/staff-members/components/staff-link-dialog";
import { StaffMemberDialog } from "@/features/staff-members/components/staff-member-dialog";
import { useStaffMembers } from "@/features/staff-members/hooks/use-staff-members";

function StaffDirectorySkeleton() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="border-border bg-card animate-pulse overflow-hidden rounded-2xl border shadow-sm motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải danh sách nhân viên...</span>
			<div
				aria-hidden="true"
				className="border-border flex justify-between border-b px-5 py-4"
			>
				<div className="space-y-2">
					<div className="bg-muted h-5 w-40 rounded-md" />
					<div className="bg-muted h-4 w-64 max-w-full rounded-md" />
				</div>
				<div className="bg-muted h-9 w-32 rounded-md" />
			</div>
			<div aria-hidden="true" className="divide-border divide-y px-5">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="grid gap-4 py-5 lg:grid-cols-4">
						<div className="bg-muted h-10 rounded-md lg:col-span-2" />
						<div className="bg-muted h-10 rounded-md" />
						<div className="bg-muted h-10 rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
}

export function StaffDirectory() {
	const { staffMembers, isLoading, error, refetch } = useStaffMembers();

	if (isLoading) {
		return <StaffDirectorySkeleton />;
	}

	if (error) {
		return (
			<section
				role="alert"
				aria-labelledby="staff-error-title"
				className="border-destructive/30 bg-destructive/5 rounded-2xl border px-5 py-10 text-center shadow-sm"
			>
				<div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-2xl">
					<CircleOff aria-hidden="true" strokeWidth={1.8} className="size-5" />
				</div>
				<h2 id="staff-error-title" className="mt-4 text-lg font-semibold">
					Không thể tải danh sách nhân viên
				</h2>
				<p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
					{error}
				</p>
				<Button
					type="button"
					variant="outline"
					className="mt-5"
					onClick={() => void refetch()}
				>
					<RotateCcw aria-hidden="true" data-icon="inline-start" />
					Thử tải lại
				</Button>
			</section>
		);
	}

	return (
		<section
			aria-labelledby="staff-directory-title"
			className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
		>
			<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2
						id="staff-directory-title"
						className="text-card-foreground text-lg font-semibold tracking-tight"
					>
						Danh sách nhân viên
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Mỗi nhân viên có một link riêng để báo lịch bận và xem lịch làm.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" className="h-7 px-2.5 font-mono tabular-nums">
						{staffMembers.length} nhân viên
					</Badge>
					<StaffMemberDialog onSaved={refetch} />
				</div>
			</header>

			{staffMembers.length > 0 ? (
				<>
					<div className="bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(14rem,1.4fr)_minmax(8rem,0.6fr)_minmax(9rem,0.7fr)_6rem] gap-4 px-5 py-3 text-xs font-medium lg:grid">
						<span>Nhân viên</span>
						<span>Trạng thái</span>
						<span>Link</span>
						<span className="text-right">Thao tác</span>
					</div>

					<div className="divide-border divide-y">
						{staffMembers.map((staffMember) => (
							<article
								key={staffMember.id}
								className="hover:bg-muted/35 grid gap-3 px-5 py-4 transition-colors lg:grid-cols-[minmax(14rem,1.4fr)_minmax(8rem,0.6fr)_minmax(9rem,0.7fr)_6rem] lg:items-center lg:gap-4"
							>
								<div className="flex min-w-0 items-center gap-3">
									<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
										<UserRound
											aria-hidden="true"
											strokeWidth={1.8}
											className="size-4"
										/>
									</div>
									<div className="min-w-0">
										<h3 className="truncate text-sm font-semibold">
											{staffMember.full_name}
										</h3>
										<p className="text-muted-foreground mt-0.5 font-mono text-xs tabular-nums">
											{staffMember.phone ?? "Chưa có số điện thoại"}
										</p>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2 lg:contents">
									<div>
										<Badge
											variant="outline"
											className={
												staffMember.is_active
													? "border-success/30 bg-success/10 text-success"
													: "border-destructive/30 bg-destructive/10 text-destructive"
											}
										>
											{staffMember.is_active ? (
												<CircleCheck aria-hidden="true" />
											) : (
												<CircleOff aria-hidden="true" />
											)}
											{staffMember.is_active ? "Đang làm" : "Đã nghỉ"}
										</Badge>
									</div>

									<div>
										<Badge variant="outline">
											{staffMember.link_created_at ? (
												<Link2 aria-hidden="true" />
											) : (
												<Link2Off aria-hidden="true" />
											)}
											{staffMember.link_created_at
												? "Đã có link"
												: "Chưa có link"}
										</Badge>
									</div>
								</div>

								<div className="flex items-center gap-1 lg:justify-end">
									{staffMember.is_active ? (
										<StaffLinkDialog
											staffMember={staffMember}
											onChanged={refetch}
										/>
									) : null}
									<StaffMemberDialog
										staffMember={staffMember}
										onSaved={refetch}
									/>
								</div>
							</article>
						))}
					</div>
				</>
			) : (
				<div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
					<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
						<UserRound aria-hidden="true" strokeWidth={1.8} className="size-5" />
					</div>
					<h3 className="mt-4 text-base font-semibold">Chưa có nhân viên</h3>
					<p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
						Thêm nhân viên rồi tạo link riêng để gửi cho từng người.
					</p>
				</div>
			)}
		</section>
	);
}
