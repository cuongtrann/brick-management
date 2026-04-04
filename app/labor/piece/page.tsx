"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatQuantity, todayISO } from "@/lib/utils";

interface Worker { id: number; name: string; }

interface PieceLog {
  id: number;
  workerId: number;
  unit: string;
  quantity: string;
  pricePerUnit: string;
  totalSalary: string;
  date: string;
  note: string | null;
  worker: { name: string };
}

export default function PieceLogPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<PieceLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [unit, setUnit] = useState("viên");
  const [customUnit, setCustomUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [logDate, setLogDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const fetchAll = () => {
    fetch("/api/workers?type=PIECE").then((r) => r.json()).then(setWorkers);
    fetch("/api/piece-logs").then((r) => r.json()).then(setLogs);
  };

  useEffect(() => { fetchAll(); }, []);

  const effectiveUnit = unit === "other" ? customUnit : unit;
  const total =
    quantity && pricePerUnit
      ? parseFloat(quantity) * parseFloat(pricePerUnit)
      : 0;

  const save = async () => {
    if (!workerId || !quantity || !pricePerUnit) {
      toast.error("Vui lòng điền đầy đủ");
      return;
    }
    await fetch("/api/piece-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: Number(workerId),
        unit: effectiveUnit,
        quantity,
        pricePerUnit,
        date: logDate,
        note: note || null,
      }),
    });
    toast.success("Đã lưu công bốc");
    setShowForm(false);
    setWorkerId("");
    setQuantity("");
    setNote("");
    fetchAll();
  };

  const deleteLog = async (id: number) => {
    if (!confirm("Xóa bản ghi này?")) return;
    await fetch(`/api/piece-logs/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchAll();
  };

  return (
    <div>
      <PageHeader
        title="Công bốc"
        subtitle="Công tính theo số viên bốc được"
        action={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Thêm
          </Button>
        }
      />

      <div className="px-4 py-3 space-y-2">
        {logs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">🧱</p>
            <p className="text-sm text-muted-foreground">Chưa có bản ghi công bốc</p>
          </div>
        )}
        {logs.map((log) => (
          <Card key={log.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-semibold text-orange-600">
                  {log.worker.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{log.worker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatQuantity(parseFloat(log.quantity))} {log.unit} ×{" "}
                    {formatCurrency(parseFloat(log.pricePerUnit))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(log.date)}
                  </p>
                  {log.note && (
                    <p className="text-xs italic text-muted-foreground mt-0.5">
                      {log.note}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(parseFloat(log.totalSalary))}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteLog(log.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nhập công bốc</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Thợ</Label>
              <Select value={workerId} onValueChange={(v) => v && setWorkerId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thợ bốc..." />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Đơn vị tính</Label>
              <Select value={unit} onValueChange={(v) => v && setUnit(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viên">Viên</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                  <SelectItem value="other">Khác...</SelectItem>
                </SelectContent>
              </Select>
              {unit === "other" && (
                <Input
                  placeholder="Đơn vị..."
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Số lượng ({effectiveUnit})</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giá / {effectiveUnit}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                />
              </div>
            </div>
            {total > 0 && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-2 text-sm font-semibold text-orange-600">
                Tổng: {formatCurrency(total)}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Ngày</Label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Input
                placeholder="..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
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
