import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	className?: string;
};

export function DashboardStatCard({
	title,
	value,
	description,
	icon: Icon,
	className
}: DashboardStatCardProps) {
	return (
		<div
			className={cn(
				"border-border bg-card text-card-foreground rounded-2xl border p-5 shadow-sm",
				className
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-muted-foreground text-sm font-medium">{title}</p>

					<p className="text-foreground mt-3 text-2xl font-bold tracking-tight">
						{value}
					</p>

					{description ? (
						<p className="text-muted-foreground mt-2 text-sm">{description}</p>
					) : null}
				</div>

				<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
					<Icon className="size-5" />
				</div>
			</div>
		</div>
	);
}
