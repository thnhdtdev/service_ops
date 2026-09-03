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
					<div className="bg-muted h-7 w-44 rounded-md" />
					<div className="bg-muted mt-3 h-4 w-80 max-w-full rounded-md" />
					<div className="bg-muted mt-5 h-10 w-full rounded-md" />
				</div>

				<div className="border-border bg-card grid grid-cols-2 overflow-hidden rounded-2xl border">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className="border-border border-l p-5 first:border-l-0 sm:p-6"
						>
							<div className="bg-muted size-5 rounded-md" />
							<div className="bg-muted mt-7 h-8 w-16 rounded-md" />
							<div className="bg-muted mt-2 h-3 w-24 rounded-md" />
						</div>
					))}
				</div>
			</div>

			<section
				aria-hidden="true"
				className="border-border bg-card overflow-hidden rounded-2xl border"
			>
				<div className="border-border border-b px-5 py-4">
					<div className="bg-muted h-5 w-44 rounded-md" />
					<div className="bg-muted mt-2 h-3 w-72 max-w-full rounded-md" />
				</div>

				<div className="hidden xl:block">
					{Array.from({ length: CUSTOMER_ROW_COUNT }).map((_, index) => (
						<div
							key={index}
							className="border-border grid grid-cols-[minmax(15rem,2fr)_0.6fr_1fr_1fr_1.1fr_4rem] items-center gap-4 border-b px-5 py-4 last:border-b-0"
						>
							<div className="flex items-center gap-3">
								<div className="bg-muted size-10 shrink-0 rounded-xl" />
								<div className="space-y-2">
									<div className="bg-muted h-4 w-32 rounded-md" />
									<div className="bg-muted h-3 w-24 rounded-md" />
								</div>
							</div>
							<div className="bg-muted h-4 w-10 rounded-md" />
							<div className="bg-muted h-5 w-16 rounded-4xl" />
							<div className="bg-muted h-4 w-24 rounded-md" />
							<div className="bg-muted h-4 w-28 rounded-md" />
							<div className="bg-muted ml-auto size-8 rounded-md" />
						</div>
					))}
				</div>

				<div className="divide-border divide-y xl:hidden">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="space-y-4 p-5">
							<div className="flex items-center gap-3">
								<div className="bg-muted size-10 shrink-0 rounded-xl" />
								<div className="flex-1 space-y-2">
									<div className="bg-muted h-4 w-36 rounded-md" />
									<div className="bg-muted h-3 w-28 rounded-md" />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-muted h-10 rounded-md" />
								<div className="bg-muted h-10 rounded-md" />
								<div className="bg-muted h-10 rounded-md" />
								<div className="bg-muted h-10 rounded-md" />
							</div>
							<div className="border-border flex justify-end border-t pt-3">
								<div className="bg-muted h-8 w-24 rounded-md" />
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
