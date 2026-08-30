import { randomUUID } from "node:crypto";

export function generateOrderCode() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = randomUUID()
    .slice(0, 4)
    .toUpperCase();

  return `SO-${year}${month}${day}-${random}`;
}