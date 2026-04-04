"use client";

import { useEffect, useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface SalesOrder {
  id: number;
  customerName: string;
  totalQuantity: string;
  pricePerUnit: string;
  totalAmount: string;
  date: string;
  allowDebt: boolean;
  totalPaid: number;
  remaining: number;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sales-orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalAmount),
    0
  );
  const totalDebt = orders.reduce((sum, o) => sum + Math.max(0, o.remaining), 0);

  return (
    <div>
      <PageHeader
        title="Bán hàng"
        subtitle="Quản lý đơn hàng"
        action={
          <Link href="/sales/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Bán hàng
            </Button>
          </Link>
        }
      />

      {/* Summary */}
      {!loading && orders.length > 0 && (
        <div className="px-4 pt-3 grid grid-cols-2 gap-3">
          <div className="stat-card-green rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Tổng doanh thu
            </p>
            <p className="font-bold text-sm">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="stat-card-red rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Tổng công nợ
            </p>
            <p className="font-bold text-sm">{formatCurrency(totalDebt)}</p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 space-y-2">
        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-muted-foreground text-sm">Chưa có đơn hàng nào</p>
          </div>
        )}
        {orders.map((order) => (
          <Link key={order.id} href={`/sales/${order.id}`}>
            <Card className="p-3 card-hover mb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{order.customerName}</p>
                    {order.remaining > 0 && (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(order.totalQuantity).toLocaleString("vi-VN")} viên ×{" "}
                    {formatCurrency(parseFloat(order.pricePerUnit))}/viên
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-sm">
                    {formatCurrency(parseFloat(order.totalAmount))}
                  </p>
                  {order.remaining > 0 ? (
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-4 mt-0.5"
                    >
                      Còn nợ {formatCurrency(order.remaining)}
                    </Badge>
                  ) : (
                    <Badge className="text-[10px] h-4 mt-0.5 bg-green-500/15 text-green-600 border-green-500/25">
                      Đã thu đủ
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
