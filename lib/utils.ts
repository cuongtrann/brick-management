import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format số thành tiền VND */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format ngày dd/MM/yyyy */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Format số lượng */
export function formatQuantity(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(num);
}

/** Lấy ngày hôm nay theo định dạng YYYY-MM-DD */
export function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

/** Tính tổng đã thanh toán và còn nợ */
export function calcDebt(
  totalAmount: number,
  payments: { paidAmount: number }[]
): { totalPaid: number; remaining: number } {
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  return { totalPaid, remaining: totalAmount - totalPaid };
}
