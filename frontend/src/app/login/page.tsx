import Image from "next/image";
import { redirect } from "next/navigation";
import { ClipboardList, ShieldCheck, UsersRound } from "lucide-react";

import { LoginForm } from "@/features/auth/components/login-form";
import { PATHS } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { ModeToggle } from "@/components/layout/mode-toggle";

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
			<div className="bg-background mx-auto grid min-h-[100dvh] overflow-hidden lg:min-h-[calc(100dvh-3rem)] lg:max-w-[1440px] lg:grid-cols-[minmax(0,1.12fr)_minmax(440px,0.88fr)] lg:rounded-3xl lg:border lg:shadow-sm">
				<aside
					aria-label="Giới thiệu ServiceOps"
					className="bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground hidden flex-col px-12 py-10 lg:flex xl:px-16 xl:py-12"
				>
					<div className="flex items-center gap-3">
						<Image
							src="/favicons.png"
							alt=""
							width={52}
							height={52}
							className="size-13 rounded-2xl shadow-sm ring-1 ring-black/5"
						/>
						<div>
							<p className="text-lg leading-tight font-bold tracking-tight">
								ServiceOps
							</p>
							<p className="text-primary-foreground/80 dark:text-muted-foreground text-sm">
								Quản lý vận hành cửa hàng
							</p>
						</div>
					</div>

					<div className="my-auto max-w-xl py-12">
						<h2 className="max-w-lg text-4xl leading-[1.08] font-bold tracking-[-0.03em] xl:text-5xl">
							Vận hành gọn. Giao đúng hẹn.
						</h2>
						<p className="text-primary-foreground/80 dark:text-muted-foreground mt-5 max-w-lg text-base leading-7">
							ServiceOps giữ đơn hàng, khách hàng và thanh toán trong một luồng làm
							việc rõ ràng.
						</p>

						<ul className="border-primary-foreground/20 divide-primary-foreground/20 dark:divide-border dark:border-border mt-10 max-w-lg divide-y border-y">
							<li className="flex items-center gap-4 py-5">
								<div className="bg-primary-foreground/10 dark:bg-primary/10 dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
									<ClipboardList aria-hidden="true" className="size-5" />
								</div>
								<div>
									<p className="font-semibold">Theo dõi đơn hàng</p>
									<p className="text-primary-foreground/75 dark:text-muted-foreground mt-0.5 text-sm">
										Từ lúc tiếp nhận đến khi giao cho khách
									</p>
								</div>
							</li>
							<li className="flex items-center gap-4 py-5">
								<div className="bg-primary-foreground/10 dark:bg-primary/10 dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
									<UsersRound aria-hidden="true" className="size-5" />
								</div>
								<div>
									<p className="font-semibold">Quản lý khách hàng</p>
									<p className="text-primary-foreground/75 dark:text-muted-foreground mt-0.5 text-sm">
										Thông tin tập trung và dễ tra cứu
									</p>
								</div>
							</li>
						</ul>
					</div>

					<div className="flex max-w-md items-start gap-3">
						<ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
						<p className="text-primary-foreground/80 dark:text-muted-foreground text-sm leading-6">
							Chỉ sử dụng tài khoản được cấp cho nhân viên cửa hàng.
						</p>
					</div>
				</aside>

				<section className="relative flex items-center px-6 py-24 sm:px-10 lg:px-14 lg:py-12 xl:px-20">
					<div className="absolute top-5 right-5 sm:top-8 sm:right-8">
						<ModeToggle />
					</div>

					<div className="mx-auto w-full max-w-[420px]">
						<div className="mb-12 flex items-center gap-3 lg:hidden">
							<Image
								src="/favicons.png"
								alt=""
								width={44}
								height={44}
								className="size-11 rounded-xl shadow-sm ring-1 ring-black/5"
							/>
							<div>
								<p className="leading-tight font-bold">ServiceOps</p>
								<p className="text-muted-foreground text-xs">
									Quản lý vận hành cửa hàng
								</p>
							</div>
						</div>

						<LoginForm />
					</div>
				</section>
			</div>
		</main>
	);
}
