"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, LayoutDashboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants/routes";

type DashboardErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			console.error("Unexpected dashboard error:", error);
		}
	}, [error]);

	return (
		<section
			role="alert"
			aria-labelledby="dashboard-error-title"
			className="border-border bg-card mx-auto w-full max-w-3xl rounded-2xl border p-6 shadow-sm sm:p-8"
		>
			<div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-xl">
				<CircleAlert aria-hidden="true" className="size-5" />
			</div>

			<h2
				id="dashboard-error-title"
				className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl"
			>
				Không thể hoàn tất thao tác
			</h2>
			<p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
				Nội dung trong khu vực này chưa được tải. Bạn có thể thử lại mà không cần rời khu
				vực quản lý.
			</p>

			<div className="mt-6 flex flex-col gap-3 sm:flex-row">
				<Button type="button" onClick={() => reset()}>
					<RotateCcw aria-hidden="true" data-icon="inline-start" />
					Thử lại
				</Button>
				<Button asChild variant="outline">
					<Link href={PATHS.HOME}>
						<LayoutDashboard aria-hidden="true" data-icon="inline-start" />
						Về trang tổng quan
					</Link>
				</Button>
			</div>
		</section>
	);
}
