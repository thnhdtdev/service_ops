import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
	title: string;
	value: string | number;
	// Short secondary line under the value, e.g. a related number
	detail?: string;
	icon: LucideIcon;
	// Bigger number and tinted background for the most important stat
	featured?: boolean;
	className?: string;
};

export function DashboardStatCard({
	title,
	value,
	detail,
	icon: Icon,
	featured = false,
	className
}: DashboardStatCardProps) {
	return (
		<div
			className={cn(
				"text-card-foreground flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm",
				featured ? "border-primary/20 bg-primary/5" : "border-border bg-card",
				className
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<p className="text-muted-foreground text-sm font-medium">{title}</p>

				<div
					className={cn(
						"text-primary flex size-10 shrink-0 items-center justify-center rounded-xl",
						featured ? "bg-primary/15" : "bg-primary/10"
					)}
				>
					<Icon aria-hidden="true" className="size-5" />
				</div>
			</div>

			<div>
				<p
					className={cn(
						"text-foreground leading-none font-bold tracking-tight tabular-nums",
						featured ? "text-3xl sm:text-4xl" : "text-2xl"
					)}
				>
					{value}
				</p>

				{detail ? <p className="text-muted-foreground mt-2 text-sm">{detail}</p> : null}
			</div>
		</div>
	);
}
