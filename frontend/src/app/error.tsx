"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
		<main className="bg-background text-foreground flex min-h-screen items-center justify-center px-5 py-10">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>
						<h1 className="text-xl font-semibold">Đã xảy ra lỗi</h1>
					</CardTitle>
					<CardDescription>
						Hệ thống chưa thể tải nội dung này. Bạn có thể thử lại hoặc quay về trang
						chính.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div
						role="alert"
						className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
					>
						Có lỗi ngoài dự kiến. Vui lòng thử lại sau ít phút.
					</div>

					<div className="mt-5 flex flex-wrap gap-3">
						<Button type="button" onClick={reset}>
							Thử lại
						</Button>
						<Button asChild variant="outline">
							<Link href={PATHS.HOME}>Về trang chính</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
