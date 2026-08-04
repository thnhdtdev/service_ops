const STAT_CARD_COUNT = 5;

export default function DashboardLoading() {
	return (
		<div role="status" aria-live="polite">
			<span className="sr-only">Đang tải nội dung quản lý...</span>

			<div aria-hidden="true" className="animate-pulse space-y-6 motion-reduce:animate-none">
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
					{Array.from({ length: STAT_CARD_COUNT }).map((_, index) => (
						<div
							key={index}
							className="border-border bg-card flex h-32 items-start justify-between rounded-2xl border p-5"
						>
							<div className="space-y-3">
								<div className="bg-muted h-4 w-24 rounded-md" />
								<div className="bg-muted h-7 w-20 rounded-md" />
								<div className="bg-muted h-3 w-28 rounded-md" />
							</div>
							<div className="bg-muted size-11 rounded-xl" />
						</div>
					))}
				</div>

				<div className="border-border bg-card overflow-hidden rounded-2xl border">
					<div className="border-border space-y-2 border-b px-5 py-4">
						<div className="bg-muted h-5 w-44 rounded-md" />
						<div className="bg-muted h-3 w-full max-w-sm rounded-md" />
					</div>
					<div className="space-y-3 p-5">
						<div className="bg-muted h-11 w-full rounded-md" />
						<div className="bg-muted h-11 w-full rounded-md" />
						<div className="bg-muted h-11 w-4/5 rounded-md" />
					</div>
				</div>
			</div>
		</div>
	);
}
