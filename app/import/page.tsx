"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
import { formatCurrency, formatDate, formatQuantity, todayISO } from "@/lib/utils";

interface Item {
  id: number;
  name: string;
  baseUnit: string;
  unitConversions: {
    id: number;
    unitName: string;
    conversionRate: string;
    minValue: string | null;
    maxValue: string | null;
    pricePerBaseUnit: string;
  }[];
}

interface ImportTxn {
  id: number;
  itemId: number;
  quantity: string;
  unitUsed: string;
  convertedQuantity: string;
  price: string;
  totalAmount: string;
  date: string;
  note: string | null;
  item: { name: string; baseUnit: string };
}

export default function ImportPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [txns, setTxns] = useState<ImportTxn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form state
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("base");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [dynamicRate, setDynamicRate] = useState("");
  const [importDate, setImportDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const fetchAll = () => {
    fetch("/api/items").then((r) => r.json()).then(setItems);
    fetch("/api/import-transactions").then((r) => r.json()).then(setTxns);
  };

  useEffect(() => { fetchAll(); }, []);

  const selectedItem = items.find((i) => String(i.id) === selectedItemId);
  const selectedConv =
    selectedUnitId !== "base"
      ? selectedItem?.unitConversions.find(
          (c) => String(c.id) === selectedUnitId
        )
      : null;

  const effectiveUnit = selectedConv
    ? selectedConv.unitName
    : selectedItem?.baseUnit ?? "";

  const convertedQty = selectedConv
    ? parseFloat(quantity || "0") * parseFloat(dynamicRate || "0")
    : parseFloat(quantity || "0");

  const effectivePrice = price
    ? parseFloat(price)
    : selectedConv
    ? parseFloat(selectedConv.pricePerBaseUnit)
    : 0;

  const totalAmount = convertedQty * effectivePrice;

  const onItemChange = (id: string) => {
    setSelectedItemId(id);
    setSelectedUnitId("base");
    setPrice("");
    setDynamicRate("");
  };

  const onUnitChange = (uid: string) => {
    setSelectedUnitId(uid);
    const item = items.find((i) => String(i.id) === selectedItemId);
    const conv = item?.unitConversions.find((c) => String(c.id) === uid);
    if (conv) {
      setPrice(conv.pricePerBaseUnit);
      setDynamicRate(conv.conversionRate);
    } else {
      setPrice("");
      setDynamicRate("");
    }
  };

  const openEdit = (txn: ImportTxn) => {
    setEditId(txn.id);
    setSelectedItemId(String(txn.itemId));
    
    const item = items.find((i) => i.id === txn.itemId);
    const conv = item?.unitConversions.find((c) => c.unitName === txn.unitUsed);
    
    if (conv) {
      setSelectedUnitId(String(conv.id));
      setDynamicRate((parseFloat(txn.convertedQuantity) / parseFloat(txn.quantity)).toString());
    } else {
      setSelectedUnitId("base");
      setDynamicRate("");
    }
    
    setQuantity(txn.quantity);
    setPrice(txn.price);
    setImportDate(txn.date.split("T")[0]);
    setNote(txn.note || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setQuantity("");
    setPrice("");
    setDynamicRate("");
    setNote("");
  };

  const saveImport = async () => {
    if (!selectedItemId || !quantity || !importDate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const url = editId ? `/api/import-transactions/${editId}` : "/api/import-transactions";
    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: Number(selectedItemId),
        quantity,
        unitUsed: effectiveUnit,
        convertedQuantity: convertedQty,
        price: effectivePrice,
        date: importDate,
        note: note || null,
      }),
    });
    toast.success(editId ? "Đã cập nhật phiếu nhập" : "Đã thêm phiếu nhập hàng");
    closeForm();
    fetchAll();
  };

  const deleteImport = async (id: number) => {
    if (!confirm("Xóa phiếu nhập này?")) return;
    await fetch(`/api/import-transactions/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchAll();
  };

  return (
    <div>
      <PageHeader
        title="Nhập hàng"
        subtitle="Quản lý phiếu nhập vật liệu"
        action={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nhập mới
          </Button>
        }
      />

      <div className="px-4 py-3 space-y-2">
        {txns.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-muted-foreground text-sm">Chưa có phiếu nhập</p>
          </div>
        )}
        {txns.map((txn) => (
          <Card key={txn.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm">{txn.item.name}</p>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {txn.unitUsed}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatQuantity(parseFloat(txn.quantity))} {txn.unitUsed} →{" "}
                  {formatQuantity(parseFloat(txn.convertedQuantity))}{" "}
                  {txn.item.baseUnit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(parseFloat(txn.price))}/{txn.item.baseUnit} •{" "}
                  {formatDate(txn.date)}
                </p>
                {txn.note && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {txn.note}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 justify-end ml-2">
                <p className="font-semibold text-sm text-primary mr-1">
                  {formatCurrency(parseFloat(txn.totalAmount))}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => openEdit(txn)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteImport(txn.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Import Form Dialog */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa phiếu nhập" : "Nhập hàng mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Hàng hóa</Label>
              <Select value={selectedItemId} onValueChange={(v) => v && onItemChange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hàng hóa...">
                    {items.find((i) => String(i.id) === selectedItemId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name} ({item.baseUnit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <>
                <div className="space-y-1.5">
                  <Label>Đơn vị</Label>
                  <Select value={selectedUnitId} onValueChange={(v) => v && onUnitChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị...">
                        {selectedUnitId === "base"
                          ? selectedItem.baseUnit
                          : selectedItem.unitConversions.find(
                              (c) => String(c.id) === selectedUnitId
                            )?.unitName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">
                        {selectedItem.baseUnit} (đơn vị cơ bản)
                      </SelectItem>
                      {selectedItem.unitConversions.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.unitName} (1 {c.unitName} ={" "}
                          {c.minValue && c.maxValue
                            ? `${c.minValue}–${c.maxValue}`
                            : c.conversionRate}{" "}
                          {selectedItem.baseUnit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedConv && (
                  <div className="space-y-1.5">
                    <Label className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                      1 {effectiveUnit} = ? {selectedItem.baseUnit}
                    </Label>
                    <Input
                      type="number"
                      placeholder={selectedConv.conversionRate}
                      value={dynamicRate}
                      onChange={(e) => setDynamicRate(e.target.value)}
                      className="border-orange-200 focus-visible:ring-orange-500"
                    />
                  </div>
                )}

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
                    <Label>Giá / {selectedItem.baseUnit}</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                {quantity && (
                  <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 text-xs space-y-1">
                    {selectedConv && (
                      <p className="text-muted-foreground">
                        Quy đổi: {quantity} {effectiveUnit} ×{" "}
                        {dynamicRate || "0"} ={" "}
                        <strong>
                          {formatQuantity(convertedQty)}{" "}
                          {selectedItem.baseUnit}
                        </strong>
                      </p>
                    )}
                    <p className="font-semibold text-primary text-sm">
                      Tổng: {formatCurrency(totalAmount)}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <Label>Ngày nhập</Label>
              <Input
                type="date"
                value={importDate}
                onChange={(e) => setImportDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú (tùy chọn)</Label>
              <Input
                placeholder="Ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>
              Hủy
            </Button>
            <Button onClick={saveImport}>{editId ? "Lưu thay đổi" : "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
