"use client";

import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/constants/payment-method";
import { SERVICE_UNIT_LABEL, type ServiceUnit } from "@/constants/service-unit";
import type { GetOrderResponse } from "@/features/orders/type";

import { formatCurrency } from "@/lib/format";

import styles from "./order-receipt.module.css";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
	hour: "2-digit",
	minute: "2-digit",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Asia/Ho_Chi_Minh"
});

type OrderReceiptProps = {
	data: GetOrderResponse;
};

function formatDateTime(value: string | null) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return dateTimeFormatter.format(date);
}

function formatQuantity(value: number | string) {
	return new Intl.NumberFormat("vi-VN", {
		maximumFractionDigits: 2
	}).format(Number(value));
}

// "pair" -> "đôi". Falls back to the raw value for an unknown unit.
function getUnitLabel(unit: string) {
	return SERVICE_UNIT_LABEL[unit as ServiceUnit] ?? unit;
}

// "bank_transfer" -> "Chuyển khoản"
function getPaymentMethodLabel(method: string) {
	return PAYMENT_METHOD_LABEL[method as PaymentMethod] ?? method;
}

export function OrderReceipt({ data }: OrderReceiptProps) {
	const { order, items, payments, customer } = data;

	const paidAmount = payments.reduce((total, payment) => total + Number(payment.amount), 0);

	const remainingAmount = Math.max(Number(order.total_amount) - paidAmount, 0);

	const paymentMethods = Array.from(new Set(payments.map((payment) => payment.method)))
		.map(getPaymentMethodLabel)
		.join(", ");

	return (
		<div className={styles.receipt}>
			<header className={styles.header}>
				{/* Brand on its own line so "SKY BLUE" is never split across lines. */}
				<p className={styles.storeName}>SKY BLUE</p>

				<p className={styles.storeTagline}>GIẶT SẤY - VỆ SINH GIÀY</p>

				{/*   = non-breaking space: keeps "TP. HCM" on one line. */}
				<p className={styles.storeInformation}>
					ĐC: 116 Đường 15, Tân Kiểng, Quận 7, TP.{" "}HCM
				</p>

				<p className={styles.storeInformation}>SĐT: 0901321045 - 0765758139</p>

				<div className={styles.divider} />

				<p className={styles.receiptTitle}>HÓA ĐƠN</p>

				<p className={styles.orderCode}>{order.order_code}</p>

				<p className={styles.createdAt}>{formatDateTime(order.created_at)}</p>
			</header>

			<div className={styles.divider} />

			<dl className={styles.infoList}>
				<dt>Khách hàng:</dt>
				<dd>{order.customer_name}</dd>

				<dt>SĐT:</dt>
				<dd>{order.customer_phone ?? "-"}</dd>

				{customer?.address ? (
					<>
						<dt>Địa chỉ:</dt>
						<dd>{customer.address}</dd>
					</>
				) : null}
			</dl>

			<div className={styles.divider} />

			<table className={styles.itemsTable}>
				<thead>
					<tr>
						<th className={styles.serviceHeader}>Dịch vụ</th>

						<th className={styles.quantityColumn}>SL</th>

						<th className={styles.amountColumn}>T.Tiền</th>
					</tr>
				</thead>

				<tbody>
					{items.map((item) => (
						<tr key={item.id}>
							<td className={styles.itemCell}>
								<div>{item.service_name}</div>

								<div className={styles.unitPrice}>
									{formatCurrency(Number(item.unit_price))}/
									{getUnitLabel(item.unit)}
								</div>
							</td>

							<td className={`${styles.itemCell} ${styles.quantityColumn}`}>
								{formatQuantity(item.quantity)}
							</td>

							<td className={`${styles.itemCell} ${styles.amountColumn}`}>
								{formatCurrency(Number(item.line_total))}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className={styles.divider} />

			<section>
				<div className={styles.totalRow}>
					<span>Tạm tính:</span>

					<span>{formatCurrency(Number(order.subtotal))}</span>
				</div>

				{Number(order.discount_amount) > 0 ? (
					<div className={styles.totalRow}>
						<span>
							Chiết khấu
							{order.discount_type === "percent"
								? ` (${Number(order.discount_value)}%)`
								: ""}
							:
						</span>

						<span>-{formatCurrency(Number(order.discount_amount))}</span>
					</div>
				) : null}

				<div className={styles.divider} />

				<div className={`${styles.totalRow} ${styles.grandTotal}`}>
					<span>Tổng thanh toán:</span>

					<span>{formatCurrency(Number(order.total_amount))}</span>
				</div>

				<div className={styles.totalRow}>
					<span>Đã thanh toán:</span>

					<span>{formatCurrency(paidAmount)}</span>
				</div>

				<div className={styles.totalRow}>
					<span>Còn lại:</span>

					<strong>{formatCurrency(remainingAmount)}</strong>
				</div>

				{paymentMethods ? (
					<p className={styles.paymentMethods}>Phương thức: {paymentMethods}</p>
				) : null}
			</section>

			{order.due_at || order.note ? (
				<>
					<div className={styles.divider} />

					<dl className={styles.infoList}>
						{order.due_at ? (
							<>
								<dt>Hẹn lấy:</dt>
								<dd>{formatDateTime(order.due_at)}</dd>
							</>
						) : null}

						{order.note ? (
							<>
								<dt>Ghi chú:</dt>
								<dd>{order.note}</dd>
							</>
						) : null}
					</dl>
				</>
			) : null}

			<section className={styles.policy}>
				<p className={styles.policyImportant}>
					* KHÁCH HÀNG VUI LÒNG KIỂM TRA KỸ TƯ TRANG CÁ NHÂN VÀ ĐỒ CÓ GIÁ TRỊ TRƯỚC KHI
					GIẶT.
				</p>

				<div>
					<p>Đơn hàng có vấn đề vui lòng báo tiệm trong vòng:</p>
					<ul className={styles.policyList}>
						<li>
							<strong>3 ngày</strong> đối với quần áo
						</li>
						<li>
							<strong>7 ngày</strong> đối với giày dép
						</li>
					</ul>
					<p className={styles.policyNote}>(Kể từ ngày nhận giày và quần áo)</p>
				</div>

				<p>
					<strong>* Lưu ý:</strong> Chỉ hỗ trợ đối với đơn hàng được lưu tại tiệm không
					quá <strong>7 ngày</strong>.
				</p>

				<p>
					Nếu quần áo / giày dép để quá <strong>1 tháng</strong>, tiệm xin phép được quyên
					góp từ thiện.
				</p>
			</section>

			<footer className={styles.policyFooter}>
				<p className={styles.footerMessage}>Cảm ơn và hẹn gặp lại!</p>
			</footer>
		</div>
	);
}
