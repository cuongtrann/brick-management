"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";

import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface OrderWithDebt {
  id: number;
  customerName: string;
  totalAmount: string;
  date: string;
  totalPaid: number;
  remaining: number;
}

export default function DebtPage() {
  const [orders, setOrders] = useState<OrderWithDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sales-orders")
      .then((r) => r.json())
      .then((data: OrderWithDebt[]) =>
        setOrders(data.filter((o) => o.remaining > 0))
      )
      .finally(() => setLoading(false));
  }, []);

  const totalDebt = orders.reduce((sum, o) => sum + o.remaining, 0);

  return (
    <div>
      <PageHeader
        title="Công nợ"
        subtitle="Danh sách khách hàng còn nợ"
      />

      {/* Total debt banner */}
      {!loading && orders.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl stat-card-red p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tổng nợ chưa thu
            </p>
          </div>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(totalDebt)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {orders.length} khách hàng
          </p>
        </div>
      )}

      <div className="px-4 py-3 space-y-2">
        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold">Không có công nợ!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tất cả khách hàng đã thanh toán đầy đủ
            </p>
          </div>
        )}
        {orders.map((order) => {
          const paidPercent = Math.round(
            (order.totalPaid / parseFloat(order.totalAmount)) * 100
          );
          return (
            <Link key={order.id} href={`/sales/${order.id}`}>
              <Card className="p-3 card-hover mb-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">
                      {formatCurrency(order.remaining)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {formatCurrency(parseFloat(order.totalAmount))}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Đã trả {formatCurrency(order.totalPaid)} ({paidPercent}%)
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
