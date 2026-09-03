const ORDER_SKELETON_COUNT = 4;

export default function CustomerDetailLoading() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="animate-pulse space-y-6 motion-reduce:animate-none"
		>
			<span className="sr-only">Đang tải hồ sơ khách hàng...</span>
			<div aria-hidden="true" className="bg-muted h-8 w-36 rounded-md" />

			<div
				aria-hidden="true"
				className="border-border bg-card overflow-hidden rounded-2xl border"
			>
				<div className="flex items-center gap-4 p-5 sm:p-6">
					<div className="bg-muted size-14 rounded-xl" />
					<div className="min-w-0 flex-1 space-y-3">
						<div className="bg-muted h-6 w-48 max-w-full rounded-md" />
						<div className="bg-muted h-4 w-72 max-w-full rounded-md" />
					</div>
				</div>
				<div className="divide-border grid divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="space-y-2 px-5 py-4">
							<div className="bg-muted h-4 w-28 rounded-md" />
							<div className="bg-muted h-7 w-24 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="border-border bg-card order-2 overflow-hidden rounded-2xl border lg:order-1">
					<div className="border-border space-y-2 border-b px-5 py-4">
						<div className="bg-muted h-5 w-40 rounded-md" />
						<div className="bg-muted h-4 w-72 max-w-full rounded-md" />
					</div>
					<div className="divide-border divide-y">
						{Array.from({ length: ORDER_SKELETON_COUNT }).map((_, index) => (
							<div key={index} className="space-y-4 px-5 py-5">
								<div className="flex flex-wrap gap-2">
									<div className="bg-muted h-5 w-24 rounded-md" />
									<div className="bg-muted h-5 w-20 rounded-4xl" />
								</div>
								<div className="bg-muted h-4 w-4/5 rounded-md" />
								<div className="bg-muted h-4 w-3/5 rounded-md" />
							</div>
						))}
					</div>
				</div>
				<div className="border-border bg-card order-1 h-72 rounded-2xl border lg:order-2" />
			</div>
		</div>
	);
}
