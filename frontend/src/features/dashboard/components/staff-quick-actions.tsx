import { CreateOrderDialog } from "@/features/orders/components/create-order-dialog";
import { OrderSearchForm } from "@/features/orders/components/order-search-form";

// Shown on the overview page of the staff account: the two things done most
// often at the counter, finding an order and creating a new one.
export function StaffQuickActions() {
	return (
		<section
			aria-labelledby="staff-quick-actions-title"
			className="border-border bg-card rounded-2xl border p-5 shadow-sm"
		>
			<h2 id="staff-quick-actions-title" className="text-base font-semibold">
				Thao tác nhanh
			</h2>
			<p className="text-muted-foreground mt-1 text-sm">
				Tìm đơn khi khách tới lấy đồ, hoặc tạo đơn mới khi khách gửi đồ.
			</p>

			<div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
				<div className="min-w-0 flex-1">
					<OrderSearchForm />
				</div>
				<CreateOrderDialog triggerClassName="h-10 md:w-auto w-full px-5" />
			</div>
		</section>
	);
}
