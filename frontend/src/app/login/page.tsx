import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
		<main className="bg-background min-h-[100dvh]">
			<div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
				<aside
					aria-label="Giới thiệu ServiceOps"
					className="bg-primary text-primary-foreground hidden flex-col justify-between px-12 py-10 lg:flex xl:px-16 xl:py-12"
				>
					<div className="flex items-center gap-3">
						<Image
							src="/favicons.png"
							alt=""
							width={48}
							height={48}
							className="size-12 rounded-xl"
						/>
						<div>
							<p className="text-lg leading-tight font-bold">ServiceOps</p>
							<p className="text-primary-foreground/90 text-sm">
								Quản lý vận hành cửa hàng
							</p>
						</div>
					</div>

					<div className="max-w-xl pb-10">
						<p className="text-primary-foreground/90 text-sm font-semibold">
							Vận hành cửa hàng giặt sấy
						</p>
						<h2 className="mt-4 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
							Giữ mọi đơn hàng trong tầm mắt.
						</h2>
						<p className="text-primary-foreground/90 mt-5 max-w-lg text-base leading-7 xl:text-lg">
							Theo dõi tiếp nhận, xử lý và thanh toán trong một quy trình rõ ràng.
						</p>
					</div>

					<div className="border-primary-foreground/20 flex max-w-md items-start gap-3 border-t pt-5">
						<ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
						<p className="text-primary-foreground/90 text-sm leading-6">
							Chỉ sử dụng tài khoản được cấp cho nhân viên cửa hàng.
						</p>
					</div>
				</aside>

				<section className="relative flex items-center px-5 py-20 sm:px-10 lg:px-14 xl:px-20">
					<div className="absolute top-5 right-5 sm:top-8 sm:right-8">
						<ModeToggle />
					</div>

					<div className="mx-auto w-full max-w-[420px]">
						<div className="mb-10 flex items-center gap-3 lg:hidden">
							<Image
								src="/favicons.png"
								alt=""
								width={40}
								height={40}
								className="size-10 rounded-lg"
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
