"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Worker {
  id: number;
  name: string;
  type: "DAILY" | "PIECE";
  phone: string | null;
}

export function WorkersTab() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"DAILY" | "PIECE">("DAILY");

  const fetchWorkers = () =>
    fetch("/api/workers")
      .then((r) => r.json())
      .then(setWorkers);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openForm = (w?: Worker) => {
    if (w) {
      setEditWorker(w);
      setName(w.name);
      setPhone(w.phone || "");
      setType(w.type);
    } else {
      setEditWorker(null);
      setName("");
      setPhone("");
      setType("DAILY");
    }
    setShowForm(true);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thợ");
      return;
    }
    const body = { name, phone, type };
    const url = editWorker ? `/api/workers/${editWorker.id}` : "/api/workers";
    const method = editWorker ? "PUT" : "POST";

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

    toast.success(editWorker ? "Đã cập nhật" : "Đã thêm thợ");
    setShowForm(false);
    fetchWorkers();
  };

  const remove = async (id: number) => {
    if (!confirm("Chắc chắn xóa thợ này?")) return;
    const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa");
        return;
    }
    toast.success("Đã xóa");
    fetchWorkers();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Quản lý danh sách thợ</p>
        <Button size="sm" onClick={() => openForm()} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Thêm thợ
        </Button>
      </div>

      <div className="space-y-3">
        {workers.length === 0 && (
          <div className="text-center py-10 opacity-60">
            <p>Chưa có thợ</p>
          </div>
        )}
        {workers.map((w) => (
          <Card key={w.id} className="p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{w.name}</p>
              <p className="text-xs text-muted-foreground">
                {w.type === "DAILY" ? "Công nhật" : "Công bốc (Sản phẩm)"} • {w.phone || "Không có SĐT"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openForm(w)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(w.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{editWorker ? "Sửa thông tin" : "Thêm thợ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên thợ</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phân loại</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as "DAILY" | "PIECE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Công nhật (tính ngày)</SelectItem>
                  <SelectItem value="PIECE">Công bốc (tính sản phẩm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
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
