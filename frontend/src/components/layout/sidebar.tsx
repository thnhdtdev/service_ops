"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/constants/routes";

type AppNavigationProps = {
	className?: string;
	onNavigate?: () => void;
};

type AppBrandProps = {
	className?: string;
};

export function AppBrand({ className }: AppBrandProps) {
	return (
		<div className={cn("flex min-w-0 items-center gap-3", className)}>
			<Image
				src="/favicons.png"
				alt=""
				width={40}
				height={40}
				className="size-10 shrink-0 rounded-xl shadow-sm ring-1 ring-black/5"
			/>

			<div className="min-w-0">
				<p className="text-foreground truncate text-base leading-tight font-bold tracking-tight">
					ServiceOps
				</p>
				<p className="text-muted-foreground mt-0.5 truncate text-xs">Quản lý vận hành</p>
			</div>
		</div>
	);
}

export function AppNavigation({ className, onNavigate }: AppNavigationProps) {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Điều hướng chính"
			className={cn("flex-1 space-y-1.5 px-3 py-4", className)}
		>
			{APP_ROUTES.map((route) => {
				const Icon = route.icon;

				const isActive =
					pathname === route.href ||
					(route.href !== "/" && pathname.startsWith(`${route.href}/`));

				return (
					<Link
						key={route.href}
						href={route.href}
						onClick={onNavigate}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
							isActive &&
								"bg-accent text-foreground before:bg-primary font-semibold before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:rounded-full"
						)}
					>
						<Icon aria-hidden="true" className="size-5 shrink-0" />
						<span className="truncate">{route.title}</span>
					</Link>
				);
			})}
		</nav>
	);
}

export function AppSidebar() {
	return (
		<aside
			aria-label="Thanh điều hướng"
			className="border-border bg-card text-foreground sticky top-0 hidden h-dvh w-60 shrink-0 self-start border-r lg:flex lg:flex-col"
		>
			<div className="border-border flex h-20 shrink-0 items-center border-b px-5">
				<AppBrand />
			</div>

			<AppNavigation />
		</aside>
	);
}
