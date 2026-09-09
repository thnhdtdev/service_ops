export type PaymentAmount = {
  amount: number | string;
};

export function sumPayments(
  payments: PaymentAmount[],
) {
  return payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount),
    0,
  );
}

export function calculateRemainingAmount(
  totalAmount: number | string,
  paidAmount: number,
) {
  return Math.max(
    Number(totalAmount) - paidAmount,
    0,
  );
}

export function calculateOrderPaymentSummary(
  totalAmount: number | string,
  payments: PaymentAmount[],
) {
  const paidAmount =
    sumPayments(payments);

  const remainingAmount =
    calculateRemainingAmount(
      totalAmount,
      paidAmount,
    );

  return {
    paidAmount,
    remainingAmount,
  };
}