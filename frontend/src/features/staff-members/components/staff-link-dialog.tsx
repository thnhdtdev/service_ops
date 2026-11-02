"use client";

import {
	Check,
	CircleAlert,
	Copy,
	Link2,
	Link2Off,
	LoaderCircle,
	TriangleAlert
} from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { PATHS } from "@/constants/routes";
import { createStaffMemberLink } from "@/features/staff-members/api/create-staff-member-link";
import { disableStaffMemberLink } from "@/features/staff-members/api/disable-staff-member-link";
import type { StaffMember } from "@/features/staff-members/types";
import { formatTime } from "@/lib/format";

type StaffLinkDialogProps = {
	staffMember: StaffMember;
	onChanged: () => void | Promise<void>;
};

export function StaffLinkDialog({ staffMember, onChanged }: StaffLinkDialogProps) {
	const [open, setOpen] = useState(false);
	// The new link only lives in this state. It is cleared when the dialog
	// closes and the server cannot show it again.
	const [linkUrl, setLinkUrl] = useState("");
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const linkInputId = useId();
	const { showSuccessToast } = useToast();

	const hasLink = staffMember.link_created_at !== null;

	function handleOpenChange(nextOpen: boolean) {
		if (isWorking) return;

		setOpen(nextOpen);
		setLinkUrl("");
		setError("");
		setIsCopied(false);
	}

	async function handleCreateLink() {
		setIsWorking(true);
		setError("");

		try {
			const { token } = await createStaffMemberLink(staffMember.id);

			setLinkUrl(`${window.location.origin}${PATHS.STAFF_PORTAL}/${token}`);
			await onChanged();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Không thể tạo link lúc này.");
		} finally {
			setIsWorking(false);
		}
	}

	async function handleDisableLink() {
		setIsWorking(true);
		setError("");

		try {
			await disableStaffMemberLink(staffMember.id);
			await onChanged();
			setOpen(false);
			showSuccessToast({
				title: "Đã vô hiệu hóa link",
				description: `Link của ${staffMember.full_name} không còn sử dụng được.`
			});
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Không thể vô hiệu hóa link lúc này."
			);
		} finally {
			setIsWorking(false);
		}
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(linkUrl);
			setIsCopied(true);
		} catch {
			setError("Không thể sao chép tự động. Hãy chọn link và sao chép thủ công.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Link của ${staffMember.full_name}`}
					title={`Link của ${staffMember.full_name}`}
				>
					<Link2 aria-hidden="true" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg" showCloseButton={!isWorking}>
				<DialogHeader className="pr-8">
					<DialogTitle>Link của {staffMember.full_name}</DialogTitle>
					<DialogDescription>
						Nhân viên mở link này để báo lịch bận và xem lịch làm, không cần đăng nhập.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{error ? (
						<div
							role="alert"
							className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
						>
							<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							<p>{error}</p>
						</div>
					) : null}

					{linkUrl ? (
						<>
							<div className="border-warning/30 bg-warning/10 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5">
								<TriangleAlert
									aria-hidden="true"
									className="text-warning mt-0.5 size-4 shrink-0"
								/>
								<p>
									Link chỉ hiển thị <strong>một lần</strong>. Hãy sao chép và gửi
									cho nhân viên ngay. Ai có link này đều xem được lịch của nhân
									viên.
								</p>
							</div>

							<div className="space-y-2">
								<label htmlFor={linkInputId} className="text-sm font-medium">
									Link mới
								</label>
								<div className="flex gap-2">
									<Input
										id={linkInputId}
										value={linkUrl}
										readOnly
										onFocus={(event) => event.target.select()}
										className="h-10 font-mono text-xs"
									/>
									<Button type="button" className="h-10" onClick={handleCopy}>
										{isCopied ? (
											<Check aria-hidden="true" data-icon="inline-start" />
										) : (
											<Copy aria-hidden="true" data-icon="inline-start" />
										)}
										{isCopied ? "Đã sao chép" : "Sao chép"}
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							<p className="text-sm leading-6">
								{hasLink ? (
									<>
										Link hiện tại được tạo lúc{" "}
										<span className="font-medium">
											{formatTime(staffMember.link_created_at as string)}
										</span>
										.
									</>
								) : (
									"Nhân viên này chưa có link."
								)}
							</p>

							{hasLink ? (
								<p className="text-muted-foreground text-sm leading-6">
									Hệ thống không lưu link gốc nên không thể xem lại. Nếu nhân viên
									làm mất link, hãy tạo link mới: link cũ sẽ ngừng hoạt động ngay.
								</p>
							) : null}
						</>
					)}
				</div>

				<DialogFooter className="mt-2">
					{linkUrl ? (
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Xong
						</Button>
					) : (
						<>
							{hasLink ? (
								<Button
									type="button"
									variant="destructive"
									onClick={handleDisableLink}
									disabled={isWorking}
								>
									<Link2Off aria-hidden="true" data-icon="inline-start" />
									Vô hiệu hóa link
								</Button>
							) : null}
							<Button type="button" onClick={handleCreateLink} disabled={isWorking}>
								{isWorking ? (
									<LoaderCircle
										aria-hidden="true"
										className="animate-spin motion-reduce:animate-none"
									/>
								) : (
									<Link2 aria-hidden="true" data-icon="inline-start" />
								)}
								{hasLink ? "Tạo link mới" : "Tạo link"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
