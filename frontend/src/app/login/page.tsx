import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { PATHS } from "@/constants/routes";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/constants/order-status";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";

// Các bước của một đơn hàng, theo đúng thứ tự xử lý tại cửa hàng.
const TICKET_STEPS: OrderStatus[] = ["received", "processing", "completed", "delivered"];

// Bước đang được làm trên phiếu minh hoạ.
const CURRENT_STEP_INDEX = 1;

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) {
		redirect(PATHS.HOME);
	}

	return (
		<main className="bg-muted/40 min-h-[100dvh] lg:p-6">
			<div className="bg-background mx-auto grid min-h-[100dvh] overflow-hidden lg:min-h-[calc(100dvh-3rem)] lg:max-w-[1440px] lg:grid-cols-2 lg:rounded-3xl lg:border lg:shadow-sm">
				<aside
					aria-label="Giới thiệu ServiceOps"
					className="bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground hidden items-center justify-center px-12 py-10 lg:flex"
				>
					<div className="w-full max-w-md">
						<div className="mb-10 flex items-center gap-3">
							<Image
								src="/favicons.png"
								alt=""
								width={44}
								height={44}
								className="size-11 rounded-xl ring-1 ring-black/5"
							/>
							<p className="text-lg font-bold tracking-tight">ServiceOps</p>
						</div>

						<OrderTicket />

						<h2 className="mt-10 max-w-md text-4xl leading-[1.1] font-bold tracking-[-0.03em] xl:text-5xl">
							Vận hành gọn. Giao đúng hẹn.
						</h2>
						<p className="text-primary-foreground/80 dark:text-muted-foreground mt-4 max-w-md text-base leading-7">
							Mỗi đơn đi từ lúc nhận đồ đến lúc trả khách trên cùng một phiếu.
						</p>
					</div>
				</aside>

				<section className="relative flex items-start px-6 py-12 sm:px-10 sm:py-16 lg:items-center lg:px-14 lg:py-12 xl:px-20">
					<div className="absolute top-5 right-5 sm:top-8 sm:right-8">
						<ModeToggle />
					</div>

					<div className="mx-auto w-full max-w-[420px]">
						<div className="mb-8 flex items-center gap-3 border-b border-dashed pb-5 lg:hidden">
							<Image
								src="/favicons.png"
								alt=""
								width={40}
								height={40}
								className="size-10 rounded-lg ring-1 ring-black/5"
							/>
							<p className="font-bold">ServiceOps</p>
						</div>

						<LoginForm />
					</div>
				</section>
			</div>
		</main>
	);
}

// Phiếu nhận đồ minh hoạ. Chỉ để trang trí nên ẩn với trình đọc màn hình.
function OrderTicket() {
	return (
		<div
			aria-hidden="true"
			className="w-full max-w-xs -rotate-2 text-slate-900 drop-shadow-xl [--paper:var(--color-white)] dark:[--paper:var(--color-slate-200)]"
		>
			<div className="rounded-t-xl bg-(--paper) px-6 pt-5 pb-6">
				<div className="flex items-baseline justify-between gap-4">
					<p className="font-bold">Phiếu nhận đồ</p>
					<p className="text-sm font-semibold tabular-nums">#0001</p>
				</div>
				<p className="mt-1 text-sm text-slate-600">Hẹn trả 17:00 hôm nay</p>

				<ol className="mt-5 border-t border-dashed border-slate-300 pt-5">
					{TICKET_STEPS.map((step, index) => {
						const isDone = index < CURRENT_STEP_INDEX;
						const isCurrent = index === CURRENT_STEP_INDEX;
						const isLast = index === TICKET_STEPS.length - 1;

						return (
							<li
								key={step}
								className="relative flex items-center gap-3 pb-4 last:pb-0"
							>
								{!isLast ? (
									<span
										className={cn(
											"absolute top-3 left-1.25 h-full w-0.5",
											isDone ? "bg-primary" : "bg-slate-300"
										)}
									/>
								) : null}

								<span
									className={cn(
										"relative size-3 shrink-0 rounded-full border-2",
										isDone && "border-primary bg-primary",
										isCurrent &&
											"border-primary bg-primary ring-primary/25 animate-in zoom-in-0 fade-in fill-mode-both ring-4 delay-500 duration-500 motion-reduce:animate-none",
										!isDone && !isCurrent && "border-slate-300 bg-(--paper)"
									)}
								/>

								<span
									className={cn(
										"text-sm",
										isCurrent ? "font-bold" : "font-medium",
										!isDone && !isCurrent && "text-slate-500"
									)}
								>
									{ORDER_STATUS_LABEL[step]}
								</span>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Mép răng cưa phía dưới, giống phiếu giấy được xé ra. */}
			<div className="h-2 bg-[radial-gradient(circle_at_8px_100%,transparent_5px,var(--paper)_5.5px)] bg-size-[16px_8px] bg-repeat-x" />
		</div>
	);
}
