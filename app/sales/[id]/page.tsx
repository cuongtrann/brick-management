"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatQuantity, todayISO } from "@/lib/utils";
import Link from "next/link";

interface Payment {
  id: number;
  paidAmount: string;
  paymentDate: string;
  note: string | null;
}

interface Order {
  id: number;
  customerName: string;
  totalQuantity: string;
  pricePerUnit: string;
  totalAmount: string;
  date: string;
  allowDebt: boolean;
  note: string | null;
  payments: Payment[];
  totalPaid: number;
  remaining: number;
  customer?: { name: string; phone: string | null; address: string | null };
}

export default function SaleDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayISO());
  const [payNote, setPayNote] = useState("");

  const fetchOrder = () =>
    fetch(`/api/sales-orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);

  useEffect(() => { fetchOrder(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (order && parseFloat(payAmount) > order.remaining) {
      toast.error("Số tiền thanh toán vượt quá số nợ còn lại");
      return;
    }
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: Number(id),
        paidAmount: payAmount,
        paymentDate: payDate,
        note: payNote || null,
      }),
    });
    toast.success("Đã ghi nhận thanh toán");
    setShowPayForm(false);
    setPayAmount("");
    setPayNote("");
    fetchOrder();
  };

  const deletePayment = async (payId: number) => {
    if (!confirm("Xóa lần thanh toán này?")) return;
    await fetch(`/api/payments/${payId}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchOrder();
  };

  const deleteOrder = async () => {
    if (!confirm("Xóa đơn hàng này và toàn bộ lịch sử thanh toán?")) return;
    await fetch(`/api/sales-orders/${id}`, { method: "DELETE" });
    toast.success("Đã xóa đơn hàng");
    router.push("/sales");
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  const isFullyPaid = order.remaining <= 0;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/sales">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-semibold">{order.customerName}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={deleteOrder}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Order summary */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Chi tiết đơn hàng</p>
            {isFullyPaid ? (
              <Badge className="bg-green-500/15 text-green-600 border-green-500/25 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Đã thanh toán
              </Badge>
            ) : (
              <Badge variant="destructive">Còn nợ</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {order.customer?.phone && (
              <Row label="SĐT Khách" value={order.customer.phone} />
            )}
            {order.customer?.address && (
              <Row label="Địa chỉ" value={order.customer.address} />
            )}
            <Row
              label="Số lượng"
              value={`${formatQuantity(parseFloat(order.totalQuantity))} viên`}
            />
            <Row
              label="Đơn giá"
              value={`${formatCurrency(parseFloat(order.pricePerUnit))}/viên`}
            />
            <Separator />
            <Row
              label="Tổng tiền"
              value={formatCurrency(parseFloat(order.totalAmount))}
              bold
            />
            <Row
              label="Đã thu"
              value={formatCurrency(order.totalPaid)}
              valueClass="text-green-600"
            />
            <Row
              label="Còn nợ"
              value={formatCurrency(Math.max(0, order.remaining))}
              valueClass={order.remaining > 0 ? "text-destructive font-semibold" : "text-green-600"}
            />
          </div>

          {order.note && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
              {order.note}
            </p>
          )}
        </Card>

        {/* Payment history */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Lịch sử thanh toán</p>
            {!isFullyPaid && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPayForm(true)}
                className="gap-1.5 h-7 text-xs"
              >
                <Plus className="h-3 w-3" />
                Thu tiền
              </Button>
            )}
          </div>

          {order.payments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Chưa có lần thanh toán nào
            </p>
          )}

          <div className="space-y-2">
            {order.payments.map((payment, idx) => (
              <Card key={payment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-4">
                        Lần {idx + 1}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                    {payment.note && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        {payment.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm text-green-600">
                      +{formatCurrency(parseFloat(payment.paidAmount))}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deletePayment(payment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick pay if still owed */}
        {!isFullyPaid && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              setPayAmount(String(order.remaining));
              setShowPayForm(true);
            }}
          >
            Thu hết nợ ({formatCurrency(order.remaining)})
          </Button>
        )}
      </div>

      {/* Payment form dialog */}
      <Dialog open={showPayForm} onOpenChange={setShowPayForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Còn lại</span>
                <span className="font-semibold text-destructive">
                  {formatCurrency(order.remaining)}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Số tiền thu</Label>
              <Input
                type="number"
                placeholder="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày thu</Label>
              <Input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Input
                placeholder="..."
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayForm(false)}>
              Hủy
            </Button>
            <Button onClick={addPayment}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${valueClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
