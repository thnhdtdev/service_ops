import Link from "next/link";
import { ArrowLeft, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CustomerNotFound() {
	return (
		<section
			aria-labelledby="customer-not-found-title"
			className="border-border bg-card mx-auto w-full max-w-2xl rounded-2xl border p-6 text-center shadow-sm sm:p-8"
		>
			<div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
				<UsersRound aria-hidden="true" strokeWidth={1.8} className="size-5" />
			</div>
			<h2 id="customer-not-found-title" className="mt-5 text-xl font-semibold tracking-tight">
				Không tìm thấy khách hàng
			</h2>
			<p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
				Hồ sơ này không tồn tại hoặc bạn không có quyền truy cập thông tin khách hàng.
			</p>
			<Button asChild variant="outline" className="mt-6">
				<Link href="/customers">
					<ArrowLeft aria-hidden="true" data-icon="inline-start" />
					Quay lại danh bạ
				</Link>
			</Button>
		</section>
	);
}
