const CUSTOMER_ROW_COUNT = 6;

export default function CustomersLoading() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="animate-pulse space-y-6 motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải danh sách khách hàng...</span>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.75fr)]">
				<div className="border-border bg-card rounded-2xl border p-5 sm:p-6">
					<div className="bg-muted h-5 w-64 max-w-full rounded-md" />
					<div className="bg-muted mt-3 h-4 w-80 max-w-full rounded-md" />
					<div className="mt-5 flex gap-3">
						<div className="bg-muted h-11 flex-1 rounded-md" />
						<div className="bg-muted h-11 w-24 rounded-md" />
					</div>
				</div>

				<div className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-2xl border">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className="border-border min-h-36 border-l p-5 first:border-l-0 sm:p-6"
						>
							<div className="bg-muted size-5 rounded-md" />
							<div className="bg-muted mt-8 h-8 w-16 rounded-md" />
							<div className="bg-muted mt-2 h-3 w-24 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<div className="border-border bg-card overflow-hidden rounded-2xl border">
				<div className="border-border border-b px-5 py-4">
					<div className="bg-muted h-5 w-44 rounded-md" />
					<div className="bg-muted mt-2 h-3 w-72 max-w-full rounded-md" />
				</div>

				<div className="divide-border divide-y">
					{Array.from({ length: CUSTOMER_ROW_COUNT }).map((_, index) => (
						<div
							key={index}
							className="grid gap-4 px-5 py-4 lg:grid-cols-5 lg:items-center"
						>
							<div className="flex items-center gap-3">
								<div className="bg-muted size-10 shrink-0 rounded-xl" />
								<div className="space-y-2">
									<div className="bg-muted h-4 w-32 rounded-md" />
									<div className="bg-muted h-3 w-24 rounded-md" />
								</div>
							</div>
							<div className="bg-muted h-4 w-28 rounded-md" />
							<div className="bg-muted h-4 w-16 rounded-md" />
							<div className="bg-muted h-4 w-24 rounded-md" />
							<div className="bg-muted h-4 w-28 rounded-md lg:ml-auto" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
