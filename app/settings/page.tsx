"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil, Users, Package, HardHat } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { CustomersTab } from "./components/CustomersTab";
import { WorkersTab } from "./components/WorkersTab";

interface UnitConversion {
  id: number;
  unitName: string;
  conversionRate: string;
  minValue: string | null;
  maxValue: string | null;
  pricePerBaseUnit: string;
}

interface Item {
  id: number;
  name: string;
  baseUnit: string;
  allowCustomUnit: boolean;
  unitConversions: UnitConversion[];
}

export default function SettingsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [showConvForm, setShowConvForm] = useState<number | null>(null);
  const [editConv, setEditConv] = useState<UnitConversion | null>(null);

  // Item form state
  const [itemName, setItemName] = useState("");
  const [baseUnit, setBaseUnit] = useState("m3");
  const [customBaseUnit, setCustomBaseUnit] = useState("");

  // Conversion form state
  const [convUnitName, setConvUnitName] = useState("");
  const [convRate, setConvRate] = useState("");
  const [convMinVal, setConvMinVal] = useState("");
  const [convMaxVal, setConvMaxVal] = useState("");
  const [convPrice, setConvPrice] = useState("");

  const fetchItems = () =>
    fetch("/api/items")
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => { fetchItems(); }, []);

  const openItemForm = (item?: Item) => {
    if (item) {
      setEditItem(item);
      setItemName(item.name);
      const stdUnits = ["m3", "tấn", "viên"];
      if (stdUnits.includes(item.baseUnit)) {
        setBaseUnit(item.baseUnit);
        setCustomBaseUnit("");
      } else {
        setBaseUnit("other");
        setCustomBaseUnit(item.baseUnit);
      }
    } else {
      setEditItem(null);
      setItemName("");
      setBaseUnit("m3");
      setCustomBaseUnit("");
    }
    setShowItemForm(true);
  };

  const saveItem = async () => {
    const unit = baseUnit === "other" ? customBaseUnit : baseUnit;
    if (!itemName.trim() || !unit.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const body = { name: itemName, baseUnit: unit, allowCustomUnit: true };
    const url = editItem ? `/api/items/${editItem.id}` : "/api/items";
    const method = editItem ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    toast.success(editItem ? "Đã cập nhật hàng hóa" : "Đã thêm hàng hóa");
    setShowItemForm(false);
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Xóa hàng hóa này? Dữ liệu liên quan cũng sẽ bị xóa.")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchItems();
  };

  const openConvForm = (itemId: number, conv?: UnitConversion) => {
    setShowConvForm(itemId);
    if (conv) {
      setEditConv(conv);
      setConvUnitName(conv.unitName);
      setConvRate(conv.conversionRate);
      setConvMinVal(conv.minValue ?? "");
      setConvMaxVal(conv.maxValue ?? "");
      setConvPrice(conv.pricePerBaseUnit);
    } else {
      setEditConv(null);
      setConvUnitName("");
      setConvRate("");
      setConvMinVal("");
      setConvMaxVal("");
      setConvPrice("");
    }
  };

  const saveConversion = async () => {
    if (!convUnitName || !convRate || !convPrice) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const body = {
      itemId: showConvForm,
      unitName: convUnitName,
      conversionRate: convRate,
      minValue: convMinVal || null,
      maxValue: convMaxVal || null,
      pricePerBaseUnit: convPrice,
    };
    const url = editConv
      ? `/api/unit-conversions/${editConv.id}`
      : "/api/unit-conversions";
    const method = editConv ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    toast.success("Đã lưu đơn vị quy đổi");
    setShowConvForm(null);
    fetchItems();
  };

  const deleteConversion = async (id: number) => {
    await fetch(`/api/unit-conversions/${id}`, { method: "DELETE" });
    toast.success("Đã xóa đơn vị");
    fetchItems();
  };

  const effectiveUnit = baseUnit === "other" ? customBaseUnit : baseUnit;

  return (
    <div>
      <PageHeader
        title="Dữ liệu gốc"
        subtitle="Quản lý danh sách hàng hóa, khách hàng, thợ..."
      />

      <div className="px-4 py-3">
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items" className="gap-1.5"><Package className="h-4 w-4" /> Hàng hóa</TabsTrigger>
            <TabsTrigger value="customers" className="gap-1.5"><Users className="h-4 w-4" /> Khách hàng</TabsTrigger>
            <TabsTrigger value="workers" className="gap-1.5"><HardHat className="h-4 w-4" /> Thợ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-4 mt-0">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Cài đặt quy đổi đơn vị</p>
              <Button size="sm" onClick={() => openItemForm()} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Thêm hàng
              </Button>
            </div>
            <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-muted-foreground text-sm">Chưa có hàng hóa nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              Thêm hàng hóa để bắt đầu quản lý
            </p>
          </div>
        )}
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📦</span>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Đơn vị: {item.baseUnit} •{" "}
                    {item.unitConversions.length} quy đổi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); openItemForm(item); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                {expandedId === item.id ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === item.id && (
              <div className="border-t border-border px-3 pb-3 bg-muted/30">
                <div className="flex items-center justify-between py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Đơn vị quy đổi
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => openConvForm(item.id)}
                  >
                    <Plus className="h-3 w-3" />
                    Thêm
                  </Button>
                </div>
                {item.unitConversions.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">
                    Chưa có đơn vị quy đổi
                  </p>
                )}
                {item.unitConversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between py-2 border-t border-border/50 first:border-t-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        1 {conv.unitName} ={" "}
                        {conv.minValue && conv.maxValue
                          ? `${conv.minValue}–${conv.maxValue}`
                          : conv.conversionRate}{" "}
                        {item.baseUnit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(parseFloat(conv.pricePerBaseUnit))}/{item.baseUnit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openConvForm(item.id, conv)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteConversion(conv.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Item Form Dialog */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Sửa hàng hóa" : "Thêm hàng hóa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tên hàng</Label>
              <Input
                placeholder="VD: Xỉ, Mạt đá, Xi măng..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn vị cơ bản</Label>
              <Select value={baseUnit} onValueChange={(v) => v && setBaseUnit(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m3">m³ (mét khối)</SelectItem>
                  <SelectItem value="tấn">Tấn</SelectItem>
                  <SelectItem value="viên">Viên</SelectItem>
                  <SelectItem value="other">Khác...</SelectItem>
                </SelectContent>
              </Select>
              {baseUnit === "other" && (
                <Input
                  placeholder="Nhập đơn vị..."
                  value={customBaseUnit}
                  onChange={(e) => setCustomBaseUnit(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemForm(false)}>
              Hủy
            </Button>
            <Button onClick={saveItem}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversion Form Dialog */}
      <Dialog
        open={showConvForm !== null}
        onOpenChange={(o) => !o && setShowConvForm(null)}
      >
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editConv ? "Sửa đơn vị quy đổi" : "Thêm đơn vị quy đổi"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên đơn vị</Label>
              <Input
                placeholder="VD: xe, bồn, lượt..."
                value={convUnitName}
                onChange={(e) => setConvUnitName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  1 {convUnitName || "đơn vị"} ={" "}
                  {effectiveUnit || "..."}
                </Label>
                <Input
                  type="number"
                  placeholder="VD: 26"
                  value={convRate}
                  onChange={(e) => setConvRate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Giá / {effectiveUnit || "đơn vị"}
                </Label>
                <Input
                  type="number"
                  placeholder="VD: 300000"
                  value={convPrice}
                  onChange={(e) => setConvPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Khoảng giá trị (tùy chọn, VD: bồn = 40–50 tấn)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={convMinVal}
                  onChange={(e) => setConvMinVal(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={convMaxVal}
                  onChange={(e) => setConvMaxVal(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvForm(null)}>
              Hủy
            </Button>
            <Button onClick={saveConversion}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </TabsContent>
          <TabsContent value="customers" className="mt-0">
            <CustomersTab />
          </TabsContent>
          <TabsContent value="workers" className="mt-0">
            <WorkersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
