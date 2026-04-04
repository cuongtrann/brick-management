"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const fetchCustomers = () =>
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openForm = (c?: Customer) => {
    if (c) {
      setEditCust(c);
      setName(c.name);
      setPhone(c.phone || "");
      setAddress(c.address || "");
    } else {
      setEditCust(null);
      setName("");
      setPhone("");
      setAddress("");
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }
    const body = { name, phone, address };
    const url = editCust ? `/api/customers/${editCust.id}` : "/api/customers";
    const method = editCust ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Lỗi lưu dữ liệu");
      return;
    }

    toast.success(editCust ? "Đã cập nhật" : "Đã thêm khách hàng");
    setShowForm(false);
    fetchCustomers();
  };

  const remove = async (id: number) => {
    if (!confirm("Chắc chắn xóa khách hàng này?")) return;
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa");
        return;
    }
    toast.success("Đã xóa");
    fetchCustomers();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Quản lý danh sách khách hàng</p>
        <Button size="sm" onClick={() => openForm()} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Thêm khách
        </Button>
      </div>

      <div className="space-y-3">
        {customers.length === 0 && (
          <div className="text-center py-10 opacity-60">
            <p>Chưa có khách hàng</p>
          </div>
        )}
        {customers.map((c) => (
          <Card key={c.id} className="p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.phone || "Không có SĐT"} • {c.address || "Không có địa chỉ"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openForm(c)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{editCust ? "Sửa thông tin" : "Thêm khách hàng"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên khách hàng</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={save}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
