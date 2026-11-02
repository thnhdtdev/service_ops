"use client";

import { CircleOff, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ShiftTemplateDialog } from "@/features/schedules/components/shift-template-dialog";
import { useShiftTemplates } from "@/features/schedules/hooks/use-shift-templates";
import { formatShiftTime } from "@/features/schedules/utils/schedule-dates";

export function ShiftTemplatesList() {
	const { shiftTemplates, isLoading, error, refetch } = useShiftTemplates();

	const nextSortOrder =
		shiftTemplates.reduce((max, template) => Math.max(max, template.sort_order), 0) + 1;

	return (
		<section
			aria-labelledby="shift-templates-title"
			className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
		>
			<header className="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2
						id="shift-templates-title"
						className="text-card-foreground text-lg font-semibold tracking-tight"
					>
						Ca mẫu
					</h2>
					<p className="text-muted-foreground mt-1 text-sm">
						Các ca đang dùng được sao chép vào cả 7 ngày khi tạo tuần mới.
					</p>
				</div>
				<ShiftTemplateDialog nextSortOrder={nextSortOrder} onSaved={refetch} />
			</header>

			{isLoading ? (
				<p role="status" className="text-muted-foreground px-5 py-8 text-center text-sm">
					Đang tải ca mẫu...
				</p>
			) : error ? (
				<p role="alert" className="text-destructive px-5 py-8 text-center text-sm">
					{error}
				</p>
			) : shiftTemplates.length > 0 ? (
				<div className="divide-border divide-y">
					{shiftTemplates.map((template) => (
						<article
							key={template.id}
							className="hover:bg-muted/35 flex items-center gap-3 px-5 py-3 transition-colors"
						>
							<div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
								<Clock aria-hidden="true" strokeWidth={1.8} className="size-4" />
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="truncate text-sm font-semibold">{template.name}</h3>
								<p className="text-muted-foreground font-mono text-xs tabular-nums">
									{formatShiftTime(template.start_time)}–
									{formatShiftTime(template.end_time)}
								</p>
							</div>
							{template.is_active ? null : (
								<Badge
									variant="outline"
									className="border-destructive/30 bg-destructive/10 text-destructive"
								>
									<CircleOff aria-hidden="true" />
									Tạm tắt
								</Badge>
							)}
							<ShiftTemplateDialog shiftTemplate={template} onSaved={refetch} />
						</article>
					))}
				</div>
			) : (
				<p className="text-muted-foreground px-5 py-8 text-center text-sm">
					Chưa có ca mẫu. Hãy thêm ca mẫu trước khi tạo tuần mới.
				</p>
			)}
		</section>
	);
}
