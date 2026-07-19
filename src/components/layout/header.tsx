"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Menu, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { APP_ROUTES, PATHS } from "@/constants/routes";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { CreateOrderDialog } from "@/features/orders/components/create-order-dialog";

type HeaderUser = {
	name: string;
	email: string;
} | null;

type AppHeaderProps = {
	user: HeaderUser;
};

function getPageTitle(pathname: string) {
	if (pathname === PATHS.CREATE_ORDER) return "Tạo đơn hàng";

	if (pathname.startsWith("/orders/") && pathname !== PATHS.CREATE_ORDER) {
		return "Chi tiết đơn hàng";
	}

	const route = APP_ROUTES.find((item) => item.href === pathname);

	return route?.title ?? "Tổng quan";
}

function getPageDescription(pathname: string) {
	if (pathname === PATHS.DASHBOARD) {
		return "Tổng quan đơn hàng hôm nay và tình hình kinh doanh.";
	}

	if (pathname === PATHS.ORDERS) {
		return "Quản lý đơn hàng, trạng thái thanh toán và tiến độ xử lý.";
	}

	if (pathname === PATHS.CREATE_ORDER) {
		return "Tạo đơn hàng giặt ủi hoặc chăm sóc giày mới.";
	}

	if (pathname === PATHS.CUSTOMERS) {
		return "Quản lý thông tin khách hàng và lịch sử đơn hàng.";
	}

	if (pathname === PATHS.SERVICES) {
		return "Quản lý giá và trạng thái cung cấp dịch vụ.";
	}

	if (pathname === PATHS.REPORTS) {
		return "Xem doanh thu, thống kê đơn hàng và các đơn chưa thanh toán.";
	}

	if (pathname === PATHS.SETTINGS) {
		return "Quản lý thiết lập hệ thống và thông tin cửa hàng.";
	}

	return "Quản lý hoạt động giặt ủi và chăm sóc giày.";
}

export function AppHeader({ user }: AppHeaderProps) {
	const pathname = usePathname();
	const router = useRouter();

	const pageTitle = getPageTitle(pathname);
	const pageDescription = getPageDescription(pathname);

	async function handleLogout() {
		const supabase = createClient();

		await supabase.auth.signOut();

		router.push(PATHS.LOGIN);
		router.refresh();
	}

	return (
		<header className="border-border bg-background flex min-h-24 items-center justify-between border-b px-5 py-4 lg:px-7">
			<div className="flex items-center gap-4">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="lg:hidden">
							<Menu className="size-5" />
							<span className="sr-only">Mở thanh điều hướng</span>
						</Button>
					</SheetTrigger>
				</Sheet>

				<div>
					<h1 className="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
						{pageTitle}
					</h1>
					<p className="text-muted-foreground mt-1 max-w-2xl text-sm">
						{pageDescription}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<CreateOrderDialog />

				<Button variant="ghost" size="icon" className="hidden sm:inline-flex">
					<Bell className="size-5" />
					<span className="sr-only">Thông báo</span>
				</Button>

				<Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
					<Link href={PATHS.SETTINGS}>
						<Settings className="size-5" />
						<span className="sr-only">Cài đặt</span>
					</Link>
				</Button>

				<ModeToggle />

				{user ? (
					<div className="border-border bg-card ml-2 flex items-center gap-3 rounded-xl border px-3 py-2">
						<div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
							<User className="size-4" />
						</div>

						<div className="hidden text-left md:block">
							<p className="text-foreground max-w-32 truncate text-sm font-medium">
								{user.name}
							</p>
							<p className="text-muted-foreground max-w-32 truncate text-xs">
								{user.email}
							</p>
						</div>

						<Button type="button" variant="ghost" size="icon" onClick={handleLogout}>
							<LogOut className="size-4" />
							<span className="sr-only">Đăng xuất</span>
						</Button>
					</div>
				) : (
					<Button asChild variant="outline">
						<Link href={PATHS.LOGIN}>
							<LogIn className="mr-2 size-4" />
							Đăng nhập
						</Link>
					</Button>
				)}
			</div>
		</header>
	);
}
