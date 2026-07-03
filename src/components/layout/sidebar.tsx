"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/constants/routes";

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<aside className="border-border bg-background text-foreground hidden h-screen w-[280px] shrink-0 border-r lg:flex lg:flex-col">
			<div className="border-border flex h-24 items-center gap-3 border-b px-7">
				<div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-2xl text-lg font-bold">
					S
				</div>

				<div>
					<h1 className="text-foreground text-lg leading-none font-bold">ServiceOps</h1>
					<p className="text-muted-foreground mt-1 text-sm">Operations</p>
				</div>
			</div>

			<nav className="flex-1 space-y-2 px-5 py-5">
				{APP_ROUTES.map((route) => {
					const Icon = route.icon;

					const isActive =
						pathname === route.href ||
						(route.href !== "/" && pathname.startsWith(route.href));

					return (
						<Link
							key={route.href}
							href={route.href}
							className={cn(
								"text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
								isActive && "bg-accent text-accent-foreground"
							)}
						>
							<Icon className="size-5" />
							<span>{route.title}</span>
						</Link>
					);
				})}
			</nav>

			<div className="border-border border-t p-5">
				<p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
					Support
				</p>

				<div className="space-y-2">
					<Link
						href="#"
						className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
					>
						<CircleHelp className="size-4" />
						Help Center
					</Link>

					<Link
						href="#"
						className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
					>
						<FileText className="size-4" />
						Documentation
					</Link>
				</div>
			</div>
		</aside>
	);
}
