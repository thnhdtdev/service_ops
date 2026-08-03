import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PATHS } from "@/constants/routes";

export default function NotFoundPage() {
	return (
		<main className="bg-background text-foreground flex min-h-screen items-center justify-center px-5 py-10">
			<Card className="w-full max-w-lg text-center">
				<CardHeader>
					<p className="text-primary text-5xl font-bold tracking-tight">404</p>
					<CardTitle>
						<h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
					</CardTitle>
					<CardDescription>
						Trang bạn đang tìm không tồn tại hoặc đường dẫn không còn hợp lệ.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<Button asChild>
						<Link href={PATHS.HOME}>Về trang chính</Link>
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
