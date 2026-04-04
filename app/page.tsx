"use client";

import { useEffect, useState } from "react";
import {
  PackagePlus,
  ShoppingCart,
  AlertCircle,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  totalImportToday: number;
  totalSalesToday: number;
  totalDebt: number;
  totalWorkerCostToday: number;
  recentOrders: {
    id: number;
    customerName: string;
    totalAmount: number;
    totalPaid: number;
    remaining: number;
    date: string;
    allowDebt: boolean;
  }[];
  recentImports: {
    id: number;
    convertedQuantity: number;
    unitUsed: string;
    totalAmount: number;
    date: string;
    item: { name: string };
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/utils").then(({ todayISO }) => {
      fetch(`/api/dashboard?date=${todayISO()}`)
        .then((r) => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    });
  }, []);


  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Hero Header */}
      <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🧱</span>
          <h1 className="text-xl font-bold gradient-text">Quản Lý Gạch</h1>
        </div>
        <p className="text-xs text-muted-foreground capitalize">{today}</p>
      </div>

      <div className="px-4 space-y-4 pt-2">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<PackagePlus className="h-4 w-4" />}
            label="Nhập hôm nay"
            value={loading ? "..." : formatCurrency(data?.totalImportToday ?? 0)}
            variant="orange"
          />
          <StatCard
            icon={<ShoppingCart className="h-4 w-4" />}
            label="Bán hôm nay"
            value={loading ? "..." : formatCurrency(data?.totalSalesToday ?? 0)}
            variant="green"
          />
          <StatCard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Tổng nợ"
            value={loading ? "..." : formatCurrency(data?.totalDebt ?? 0)}
            variant="red"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Công thợ hôm nay"
            value={loading ? "..." : formatCurrency(data?.totalWorkerCostToday ?? 0)}
            variant="blue"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction href="/import" emoji="📦" label="Nhập hàng" />
            <QuickAction href="/sales/new" emoji="💰" label="Bán hàng" />
            <QuickAction href="/labor/attendance" emoji="📋" label="Chấm công" />
            <QuickAction href="/debt" emoji="🔔" label="Công nợ" />
          </div>
        </div>

        {/* Recent Orders */}
        {(data?.recentOrders?.length ?? 0) > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                Đơn hàng gần đây
              </h2>
              <Link href="/sales" className="text-xs text-primary">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-2">
              {data?.recentOrders.map((order) => (
                <Link key={order.id} href={`/sales/${order.id}`}>
                  <Card className="p-3 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        {order.remaining > 0 && (
                          <Badge variant="destructive" className="text-[10px] h-4 mt-0.5">
                            Nợ {formatCurrency(order.remaining)}
                          </Badge>
                        )}
                        {order.remaining <= 0 && (
                          <Badge className="text-[10px] h-4 mt-0.5 bg-green-500/15 text-green-600 border-green-500/25">
                            Đã thanh toán
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Imports */}
        {(data?.recentImports?.length ?? 0) > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Nhập hàng gần đây
              </h2>
              <Link href="/import" className="text-xs text-primary">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-2">
              {data?.recentImports.map((txn) => (
                <Card key={txn.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{txn.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatQuantity(txn.convertedQuantity)} {txn.unitUsed} •{" "}
                        {formatDate(txn.date)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(txn.totalAmount)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && !data?.recentOrders?.length && !data?.recentImports?.length && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🧱</p>
            <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
            <p className="text-xs text-muted-foreground mt-1">
              Bắt đầu bằng cách cài đặt hàng hóa và nhập hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: "orange" | "green" | "red" | "blue";
}) {
  return (
    <div className={`rounded-xl p-3 stat-card-${variant}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={
            variant === "orange"
              ? "text-orange-500"
              : variant === "green"
              ? "text-green-500"
              : variant === "red"
              ? "text-red-500"
              : "text-blue-500"
          }
        >
          {icon}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-base font-bold leading-tight">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-3 card-hover flex items-center gap-2.5">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
      </Card>
    </Link>
  );
}
