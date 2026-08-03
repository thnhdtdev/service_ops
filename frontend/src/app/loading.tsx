export default function Loading() {
	return (
		<main className="bg-background text-foreground min-h-screen px-5 py-8 lg:px-7">
			<p role="status" className="sr-only">
				Đang tải nội dung...
			</p>

			<div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
				<div className="animate-pulse space-y-3">
					<div className="bg-muted h-8 w-48 rounded-lg" />
					<div className="bg-muted h-4 w-full max-w-md rounded" />
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className="border-border bg-card h-32 animate-pulse rounded-2xl border"
						/>
					))}
				</div>

				<div className="border-border bg-card h-64 animate-pulse rounded-2xl border" />
			</div>
		</main>
	);
}
