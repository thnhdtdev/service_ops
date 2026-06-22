"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/constants/routes";

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<aside className="hidden h-screen w-[280px] shrink-0 border-r border-border bg-background text-foreground lg:flex lg:flex-col">
			<div className="flex h-24 items-center gap-3 border-b border-border px-7">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
					S
				</div>

				<div>
					<h1 className="text-lg font-bold leading-none text-foreground">ServiceOps</h1>
					<p className="mt-1 text-sm text-muted-foreground">Operations</p>
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
								"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
								isActive && "bg-accent text-accent-foreground"
							)}
						>
							<Icon className="size-5" />
							<span>{route.title}</span>
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-border p-5">
				<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Support
				</p>

				<div className="space-y-2">
					<Link
						href="#"
						className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<CircleHelp className="size-4" />
						Help Center
					</Link>

					<Link
						href="#"
						className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<FileText className="size-4" />
						Documentation
					</Link>
				</div>
			</div>
		</aside>
	);
}
