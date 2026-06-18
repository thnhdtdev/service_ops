export const PAYMENT_METHOD = {
    CASH: "cash",
    BANK_TRANSFER: "bank_transfer",
    OTHER: "other",
  } as const;
  
  export const PAYMENT_METHOD_LABEL = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    other: "Khác",
  } as const;
  
  export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABEL;