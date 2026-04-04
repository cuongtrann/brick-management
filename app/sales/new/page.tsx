"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCurrency, todayISO } from "@/lib/utils";

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [date, setDate] = useState(todayISO());
  const [allowDebt, setAllowDebt] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCustForm, setShowCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const total =
    totalQuantity && pricePerUnit
      ? parseFloat(totalQuantity) * parseFloat(pricePerUnit)
      : 0;

  const saveCustomer = async () => {
    if (!newCustName.trim()) return;
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCustName, phone: newCustPhone, address: newCustAddress }),
    });
    const c = await res.json();
    if (!res.ok) {
      toast.error(c.error);
      return;
    }
    toast.success("Đã thêm khách hàng");
    setCustomers((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)));
    setCustomerId(String(c.id));
    setShowCustForm(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  };

  const save = async () => {
    if (!customerId || !totalQuantity || !pricePerUnit) {
      toast.error("Vui lòng điền đủ thông tin & chọn khách hàng");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          totalQuantity,
          pricePerUnit,
          date,
          allowDebt,
          note: note || null,
        }),
      });
      const order = await res.json();
      toast.success("Đã tạo đơn hàng");
      router.push(`/sales/${order.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Tạo đơn hàng" />

      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Khách hàng</Label>
            <div className="flex gap-2">
              <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn khách hàng...">
                    {customers.find((c) => String(c.id) === customerId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCustForm(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Số lượng (viên)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn giá / viên</Label>
              <Input
                type="number"
                placeholder="1000"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Total preview */}
          {total > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {parseFloat(totalQuantity).toLocaleString("vi-VN")} viên ×{" "}
                  {formatCurrency(parseFloat(pricePerUnit))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Tổng tiền</span>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-1.5">
            <Label>Ngày bán</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Debt toggle */}
          <div
            className="flex items-center justify-between py-2 cursor-pointer"
            onClick={() => setAllowDebt(!allowDebt)}
          >
            <div>
              <p className="text-sm font-medium">Cho công nợ</p>
              <p className="text-xs text-muted-foreground">
                Khách chưa trả hết tiền
              </p>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative ${
                allowDebt ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  allowDebt ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ghi chú (tùy chọn)</Label>
            <Input
              placeholder="..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </Card>

        <Button className="w-full" size="lg" onClick={save} disabled={saving}>
          {saving ? "Đang lưu..." : "Tạo đơn hàng"}
        </Button>
      </div>

      <Dialog open={showCustForm} onOpenChange={setShowCustForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên khách hàng</Label>
              <Input
                placeholder="Nguyễn Văn A"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại (tùy chọn)</Label>
              <Input
                placeholder="09..."
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ (tùy chọn)</Label>
              <Input
                placeholder="Số nhà, phố..."
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustForm(false)}>
              Hủy
            </Button>
            <Button onClick={saveCustomer}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
