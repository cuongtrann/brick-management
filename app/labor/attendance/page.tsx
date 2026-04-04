"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
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
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";

interface Worker {
  id: number;
  name: string;
}

interface Attendance {
  id: number;
  workerId: number;
  date: string;
  workingDay: string;
  dailyRate: string;
  totalSalary: string;
  note: string | null;
  worker: { name: string };
}

export default function AttendancePage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [date, setDate] = useState(todayISO());
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [workerId, setWorkerId] = useState("");
  const [workingDay, setWorkingDay] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [note, setNote] = useState("");

  const fetchRecords = (d: string) =>
    fetch(`/api/attendance?date=${d}`)
      .then((r) => r.json())
      .then(setRecords);

  useEffect(() => {
    fetch("/api/workers?type=DAILY").then((r) => r.json()).then(setWorkers);
  }, []);

  useEffect(() => { fetchRecords(date); }, [date]);

  const changeDate = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split("T")[0]);
  };

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const totalToday = records.reduce(
    (sum, r) => sum + parseFloat(r.totalSalary),
    0
  );

  const save = async () => {
    if (!workerId || !workingDay || !dailyRate) {
      toast.error("Vui lòng điền đầy đủ");
      return;
    }
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: Number(workerId),
        date,
        workingDay,
        dailyRate,
        note: note || null,
      }),
    });
    toast.success("Đã chấm công");
    setShowForm(false);
    setWorkerId("");
    setNote("");
    fetchRecords(date);
  };

  const deleteRecord = async (id: number) => {
    await fetch(`/api/attendance/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchRecords(date);
  };

  return (
    <div>
      <PageHeader
        title="Chấm công nhật"
        action={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Chấm công
          </Button>
        }
      />

      {/* Date navigator */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <Button size="icon" variant="ghost" onClick={() => changeDate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">{dateLabel}</p>
          {records.length > 0 && (
            <p className="text-xs text-primary font-medium mt-0.5">
              Tổng: {formatCurrency(totalToday)}
            </p>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={() => changeDate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-muted-foreground">Chưa có công ngày này</p>
          </div>
        )}
        {records.map((rec) => (
          <Card key={rec.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {rec.worker.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{rec.worker.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] h-4">
                      {rec.workingDay} ngày
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      × {formatCurrency(parseFloat(rec.dailyRate))}
                    </span>
                  </div>
                  {rec.note && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">
                      {rec.note}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(parseFloat(rec.totalSalary))}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteRecord(rec.id)}
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
            <DialogTitle>Chấm công - {dateLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Thợ</Label>
              <Select value={workerId} onValueChange={(v) => v && setWorkerId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thợ..." />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Số công</Label>
                <Select value={workingDay} onValueChange={(v) => v && setWorkingDay(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 công</SelectItem>
                    <SelectItem value="1">1 công</SelectItem>
                    <SelectItem value="1.5">1.5 công</SelectItem>
                    <SelectItem value="2">2 công</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tiền / công</Label>
                <Input
                  type="number"
                  placeholder="VD: 350000"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                />
              </div>
            </div>
            {workingDay && dailyRate && (
              <div className="rounded-lg bg-primary/5 border border-primary/15 p-2 text-sm font-semibold text-primary">
                Tổng: {formatCurrency(parseFloat(workingDay) * parseFloat(dailyRate))}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Ghi chú (tùy chọn)</Label>
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
