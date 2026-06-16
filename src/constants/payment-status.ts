export const PAYMENT_STATUS = {
    UNPAID: "unpaid",
    DEPOSIT: "deposit",
    PAID: "paid",
  } as const;
  
  export const PAYMENT_STATUS_LABEL = {
    unpaid: "Chưa thanh toán",
    deposit: "Đã cọc",
    paid: "Đã thanh toán",
  } as const;
  
  export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABEL;