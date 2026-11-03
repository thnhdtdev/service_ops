"use client";

import { BellRing, CircleAlert, LoaderCircle, Send, Share, SquarePlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";

function InstallGuide() {
	return (
		<div className="bg-muted/50 rounded-xl p-4 text-sm leading-6">
			<p className="font-medium">Trên iPhone, cần thêm ứng dụng vào Màn hình chính trước:</p>
			<ol className="mt-2 list-decimal space-y-1.5 pl-5">
				<li>Mở trang này bằng Safari.</li>
				<li>
					Bấm nút <strong>Chia sẻ</strong>{" "}
					<Share aria-hidden="true" className="inline size-4 align-text-bottom" />
				</li>
				<li>
					Chọn <strong>Thêm vào MH chính</strong>{" "}
					<SquarePlus aria-hidden="true" className="inline size-4 align-text-bottom" />
				</li>
				<li>
					Mở <strong>ServiceOps</strong> từ Màn hình chính, vào <strong>Cài đặt</strong>{" "}
					và bấm <strong>Bật thông báo</strong>.
				</li>
			</ol>
			<p className="text-muted-foreground mt-2 text-xs">Cần iOS 16.4 trở lên.</p>
		</div>
	);
}

export function PushNotificationsCard() {
	const { status, isWorking, error, enable, disable, sendTest } = usePushNotifications();
	const isOn = status === "on";

	return (
		<section
			aria-labelledby="push-notifications-title"
			className="border-border bg-card max-w-2xl rounded-2xl border p-5 shadow-sm"
		>
			<div className="flex items-start gap-4">
				<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
					<BellRing aria-hidden="true" className="size-5" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h2 id="push-notifications-title" className="text-base font-semibold">
							Thông báo thanh toán
						</h2>
						{status === "on" || status === "off" ? (
							<Badge
								variant="outline"
								className={
									isOn
										? "border-success/30 bg-success/10 text-success"
										: "text-muted-foreground"
								}
							>
								{isOn ? "Đang bật" : "Đang tắt"}
							</Badge>
						) : null}
					</div>
					<p className="text-muted-foreground mt-1 text-sm">
						Nhận thông báo trên thiết bị này mỗi khi tiệm ghi nhận một khoản thanh toán.
					</p>
				</div>
			</div>

			<div className="mt-5 space-y-4">
				{status === "checking" ? (
					<p role="status" className="text-muted-foreground text-sm">
						Đang kiểm tra thiết bị...
					</p>
				) : null}

				{status === "needs-install" ? <InstallGuide /> : null}

				{status === "unsupported" ? (
					<p className="text-muted-foreground text-sm">
						Trình duyệt này không hỗ trợ thông báo đẩy. Hãy dùng Safari trên iPhone (đã
						thêm vào Màn hình chính) hoặc Chrome trên máy tính.
					</p>
				) : null}

				{status === "denied" ? (
					<p className="text-muted-foreground text-sm">
						Thông báo đang bị chặn. Trên iPhone, vào <strong>Cài đặt</strong> →{" "}
						<strong>Thông báo</strong> → <strong>ServiceOps</strong> để cho phép; trên
						máy tính, cho phép trong cài đặt trang của trình duyệt. Sau đó mở lại trang
						này.
					</p>
				) : null}

				{error ? (
					<div
						role="alert"
						className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5"
					>
						<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
						<p>{error}</p>
					</div>
				) : null}

				{status === "off" ? (
					<Button type="button" onClick={enable} disabled={isWorking}>
						{isWorking ? (
							<LoaderCircle
								aria-hidden="true"
								className="animate-spin motion-reduce:animate-none"
							/>
						) : (
							<BellRing aria-hidden="true" data-icon="inline-start" />
						)}
						Bật thông báo
					</Button>
				) : null}

				{isOn ? (
					<div className="flex flex-wrap gap-2">
						<Button type="button" onClick={sendTest} disabled={isWorking}>
							{isWorking ? (
								<LoaderCircle
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<Send aria-hidden="true" data-icon="inline-start" />
							)}
							Gửi thử
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={disable}
							disabled={isWorking}
						>
							Tắt thông báo
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}
