"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Worker {
  id: number;
  name: string;
  type: "DAILY" | "PIECE";
  phone: string | null;
}

export default function LaborPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"DAILY" | "PIECE">("DAILY");
  const [phone, setPhone] = useState("");

  const fetchWorkers = () =>
    fetch("/api/workers").then((r) => r.json()).then(setWorkers);

  useEffect(() => { fetchWorkers(); }, []);

  const saveWorker = async () => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên thợ"); return; }
    await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, phone: phone || null }),
    });
    toast.success("Đã thêm thợ");
    setShowForm(false);
    setName("");
    setPhone("");
    fetchWorkers();
  };

  const deleteWorker = async (id: number) => {
    if (!confirm("Xóa thợ này? Dữ liệu công liên quan cũng sẽ bị xóa.")) return;
    await fetch(`/api/workers/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchWorkers();
  };

  const daily = workers.filter((w) => w.type === "DAILY");
  const piece = workers.filter((w) => w.type === "PIECE");

  return (
    <div>
      <PageHeader
        title="Công thợ"
        subtitle="Quản lý thợ nhật và thợ bốc"
        action={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Thêm thợ
          </Button>
        }
      />

      <div className="px-4 py-3 space-y-4">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/labor/attendance">
            <Card className="p-3 card-hover text-center">
              <p className="text-2xl mb-1">📋</p>
              <p className="text-sm font-semibold">Chấm công nhật</p>
              <p className="text-xs text-muted-foreground">Tính theo ngày</p>
            </Card>
          </Link>
          <Link href="/labor/piece">
            <Card className="p-3 card-hover text-center">
              <p className="text-2xl mb-1">🧱</p>
              <p className="text-sm font-semibold">Công bốc</p>
              <p className="text-xs text-muted-foreground">Tính theo viên</p>
            </Card>
          </Link>
        </div>

        {/* Daily workers */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Thợ nhật ({daily.length})
          </p>
          {daily.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">Chưa có thợ nhật</p>
          )}
          {daily.map((w) => (
            <WorkerCard key={w.id} worker={w} onDelete={deleteWorker} />
          ))}
        </div>

        {/* Piece workers */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Thợ bốc ({piece.length})
          </p>
          {piece.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">Chưa có thợ bốc</p>
          )}
          {piece.map((w) => (
            <WorkerCard key={w.id} worker={w} onDelete={deleteWorker} />
          ))}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Thêm thợ mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Tên thợ</Label>
              <Input
                placeholder="Nguyễn Văn A..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Loại công</Label>
              <Select value={type} onValueChange={(v) => setType(v as "DAILY" | "PIECE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Công nhật (tính theo ngày)</SelectItem>
                  <SelectItem value="PIECE">Công bốc (tính theo viên)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại (tùy chọn)</Label>
              <Input
                type="tel"
                placeholder="0xxx..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={saveWorker}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkerCard({
  worker,
  onDelete,
}: {
  worker: Worker;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="flex items-center justify-between p-3 mb-2">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {worker.name[0]}
        </div>
        <div>
          <p className="text-sm font-medium">{worker.name}</p>
          {worker.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {worker.phone}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className={
            worker.type === "DAILY"
              ? "text-blue-500 border-blue-200 bg-blue-50 text-[10px]"
              : "text-orange-500 border-orange-200 bg-orange-50 text-[10px]"
          }
        >
          {worker.type === "DAILY" ? "Nhật" : "Bốc"}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(worker.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
