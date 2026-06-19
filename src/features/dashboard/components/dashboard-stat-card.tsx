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
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>

          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}