import Link from "next/link";
import { FileQuestion, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants/routes";

export default function NotFoundPage() {
	return (
		<main className="bg-background text-foreground flex min-h-[100dvh] items-center justify-center px-5 py-10">
			<section
				aria-labelledby="not-found-title"
				className="border-border bg-card w-full max-w-xl rounded-2xl border p-6 shadow-sm sm:p-8"
			>
				<div className="flex items-center gap-3">
					<div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
						<FileQuestion aria-hidden="true" className="size-5" />
					</div>
					<p className="text-muted-foreground font-mono text-sm font-semibold tabular-nums">
						Lỗi 404
					</p>
				</div>

				<h1
					id="not-found-title"
					className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl"
				>
					Không tìm thấy trang
				</h1>
				<p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
					Đường dẫn này không tồn tại hoặc trang đã được chuyển sang vị trí khác.
				</p>

				<Button asChild className="mt-6">
					<Link href={PATHS.HOME}>
						<LayoutDashboard aria-hidden="true" data-icon="inline-start" />
						Về trang tổng quan
					</Link>
				</Button>
			</section>
		</main>
	);
}
