"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogIn, LogOut, Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { APP_ROUTES, PATHS } from "@/constants/routes";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AppBrand, AppNavigation } from "@/components/layout/sidebar";
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
	if (pathname === PATHS.HOME || pathname === PATHS.DASHBOARD) {
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [logoutError, setLogoutError] = useState("");

	const pageTitle = getPageTitle(pathname);
	const pageDescription = getPageDescription(pathname);

	async function handleLogout() {
		setLogoutError("");
		setIsLoggingOut(true);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.signOut();

			if (error) {
				setLogoutError("Đăng xuất thất bại. Vui lòng thử lại.");
				return;
			}

			window.location.replace(PATHS.LOGIN);
		} catch {
			setLogoutError("Không thể đăng xuất lúc này. Vui lòng thử lại sau.");
		} finally {
			setIsLoggingOut(false);
		}
	}

	return (
		<header className="border-border bg-background sticky top-0 z-20 border-b">
			<div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:h-20 lg:px-8">
				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="-ml-2 size-11 lg:hidden">
								<Menu aria-hidden="true" className="size-5" />
								<span className="sr-only">Mở thanh điều hướng</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-[min(20rem,calc(100vw-2rem))] gap-0 p-0 sm:max-w-80"
						>
							<SheetHeader className="border-border border-b px-5 py-5">
								<SheetTitle className="sr-only">Điều hướng ServiceOps</SheetTitle>
								<SheetDescription className="sr-only">
									Chọn một trang để tiếp tục
								</SheetDescription>
								<AppBrand />
							</SheetHeader>
							<AppNavigation onNavigate={() => setIsMobileMenuOpen(false)} />
							<div className="border-border mt-auto border-t px-4 py-4 sm:hidden">
								<div className="flex items-center justify-between gap-3">
									<span className="text-muted-foreground text-sm font-medium">
										Giao diện
									</span>
									<ModeToggle />
								</div>
							</div>
						</SheetContent>
					</Sheet>

					<div className="min-w-0">
						<h1 className="text-foreground truncate text-lg font-bold tracking-tight sm:text-xl lg:text-2xl">
							{pageTitle}
						</h1>
						<p className="text-muted-foreground mt-0.5 hidden max-w-2xl truncate text-sm md:block">
							{pageDescription}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<CreateOrderDialog />

					<div className="hidden sm:block">
						<ModeToggle />
					</div>

					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-10 max-w-48 gap-2 rounded-lg px-1.5 sm:px-2"
									aria-label={`Mở menu tài khoản của ${user.name}`}
									aria-busy={isLoggingOut}
								>
									<span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
										<User aria-hidden="true" className="size-4" />
									</span>
									<span className="hidden max-w-28 truncate text-sm font-medium xl:block">
										{user.name}
									</span>
									<ChevronDown
										aria-hidden="true"
										className="text-muted-foreground hidden size-3.5 sm:block"
									/>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-64">
								<DropdownMenuLabel className="px-2 py-2 font-normal">
									<span className="text-foreground block truncate text-sm font-semibold">
										{user.name}
									</span>
									<span className="text-muted-foreground mt-0.5 block truncate text-xs">
										{user.email}
									</span>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 px-2 py-2.5"
									disabled={isLoggingOut}
									onSelect={(event) => {
										event.preventDefault();
										void handleLogout();
									}}
								>
									<LogOut aria-hidden="true" className="size-4" />
									{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
								</DropdownMenuItem>
								{logoutError ? (
									<p
										role="alert"
										className="text-destructive px-2 py-2 text-xs leading-5"
									>
										{logoutError}
									</p>
								) : null}
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild variant="outline" size="icon" className="sm:w-auto sm:px-3">
							<Link href={PATHS.LOGIN}>
								<LogIn aria-hidden="true" className="size-4" />
								<span className="hidden sm:inline">Đăng nhập</span>
								<span className="sr-only sm:hidden">Đăng nhập</span>
							</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
