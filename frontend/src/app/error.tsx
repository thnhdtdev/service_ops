"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, LayoutDashboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants/routes";

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			console.error("Unexpected route error:", error);
		}
	}, [error]);

	return (
		<main className="bg-background text-foreground flex min-h-[100dvh] items-center justify-center px-5 py-10">
			<section
				role="alert"
				aria-labelledby="error-title"
				className="border-border bg-card w-full max-w-xl rounded-2xl border p-6 shadow-sm sm:p-8"
			>
				<div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-xl">
					<CircleAlert aria-hidden="true" className="size-5" />
				</div>

				<h1
					id="error-title"
					className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl"
				>
					Không thể hoàn tất thao tác
				</h1>
				<p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
					Nội dung chưa được tải do một lỗi ngoài dự kiến. Bạn có thể thử lại hoặc quay về
					trang tổng quan.
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
		</main>
	);
}
