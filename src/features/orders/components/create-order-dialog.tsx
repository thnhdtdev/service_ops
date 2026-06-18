"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateOrderDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          <span className="hidden sm:inline">Create Order</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng, chọn dịch vụ và hệ thống sẽ tự tính tổng tiền.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Thông tin khách hàng
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên khách hàng</label>
                <div className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Input tên khách hàng
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <div className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Input số điện thoại
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Dịch vụ
            </h3>

            <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Sau này chỗ này sẽ là form chọn dịch vụ: giặt sấy, vệ sinh giày,
              giặt chăn, số kg, số đôi, số cái và tự tính thành tiền.
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Tổng kết đơn hàng
            </h3>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="text-xl font-bold text-foreground">0đ</span>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Hủy
            </Button>

            <Button type="button">Tạo đơn hàng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}