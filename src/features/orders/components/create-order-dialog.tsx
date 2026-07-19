"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { CreateOrderForm } from "@/features/orders/components/create-order-form";

export function CreateOrderDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 size-4" />
					<span className="hidden sm:inline">Tạo đơn hàng</span>
					<span className="sm:hidden">Tạo đơn</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[1000px]">
				<DialogHeader>
					<DialogTitle>Tạo đơn hàng mới</DialogTitle>
					<DialogDescription>
						Nhập thông tin khách hàng, chọn dịch vụ và hệ thống sẽ tự tính tổng tiền.
					</DialogDescription>
				</DialogHeader>

				<CreateOrderForm onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
