const ORDER_SKELETON_COUNT = 5;

export default function CustomerDetailLoading() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="animate-pulse space-y-6 motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải hồ sơ khách hàng...</span>

			<div className="bg-muted h-8 w-36 rounded-md" />

			<div className="border-border bg-card overflow-hidden rounded-2xl border">
				<div className="flex items-center gap-4 p-5 sm:p-6">
					<div className="bg-muted size-14 rounded-2xl" />
					<div className="space-y-3">
						<div className="bg-muted h-6 w-48 rounded-md" />
						<div className="bg-muted h-4 w-72 max-w-full rounded-md" />
					</div>
				</div>
				<div className="border-border grid border-t sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="border-border px-5 py-4 sm:border-l sm:first:border-l-0"
						>
							<div className="bg-muted h-7 w-16 rounded-md" />
							<div className="bg-muted mt-2 h-4 w-28 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<div className="border-border bg-card overflow-hidden rounded-2xl border">
				<div className="border-border border-b px-5 py-4">
					<div className="bg-muted h-5 w-40 rounded-md" />
					<div className="bg-muted mt-2 h-4 w-80 max-w-full rounded-md" />
				</div>
				<div className="divide-border divide-y">
					{Array.from({ length: ORDER_SKELETON_COUNT }).map((_, index) => (
						<div
							key={index}
							className="grid gap-3 px-5 py-4 sm:grid-cols-4 sm:items-center"
						>
							<div className="space-y-2">
								<div className="bg-muted h-4 w-28 rounded-md" />
								<div className="bg-muted h-3 w-36 rounded-md" />
							</div>
							<div className="bg-muted h-5 w-32 rounded-4xl" />
							<div className="bg-muted h-4 w-24 rounded-md sm:ml-auto" />
							<div className="bg-muted size-4 rounded-md sm:ml-auto" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
