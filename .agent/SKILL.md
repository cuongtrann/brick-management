# 🧱 Brick Management System - Skill Definition

## 1. Overview

Hệ thống dùng để quản lý:

- Nhập hàng (vật liệu xây dựng)
- Công thợ
- Bán hàng (gạch)
- Công nợ khách hàng

Hệ thống phải linh hoạt về đơn vị và quy đổi.

---

## 2. Inventory (Quản lý nhập hàng)

### 2.1 Item (Hàng hóa)

Mỗi hàng hóa gồm:

- `name`: Tên hàng (ví dụ: xỉ, mạt đá, xi măng)
- `base_unit`: Đơn vị cơ bản (m3, tấn, viên...)
- `allow_custom_unit`: true/false (cho phép quy đổi đơn vị)

---

### 2.2 Unit Conversion (Quy đổi đơn vị)

Cho phép định nghĩa đơn vị tùy chỉnh:

#### Ví dụ:

- 1 xe xỉ = 26 m3
- Giá: 300,000 / m3

#### Hoặc:

- 1 bồn xi măng = 40 - 50 tấn
- Giá nhập theo tấn

#### Cấu trúc:

- `unit_name`: tên đơn vị (xe, bồn, lượt...)
- `conversion_rate`: số lượng quy đổi về base_unit
- `min_value`, `max_value`: (optional, dùng cho khoảng như bồn xi măng)
- `price_per_base_unit`: giá theo đơn vị cơ bản

---

### 2.3 Import Transaction (Nhập hàng)

- `item_id`
- `quantity`
- `unit_used` (xe, bồn...)
- `converted_quantity` (tự tính ra base_unit)
- `price`
- `total_amount`
- `date`

---

## 3. Labor Management (Công thợ)

### 3.1 Worker (Thợ)

- `name`
- `type`:
  - `DAILY` (công nhật)
  - `PIECE` (công theo sản phẩm)

---

### 3.2 Daily Worker (Công nhật)

- Chấm công theo ngày:
  - `date`
  - `worker_id`
  - `working_day` (0.5, 1, ...)
  - `daily_rate`
  - `total_salary`

---

### 3.3 Piece Worker (Công bốc)

- Tính theo số lượng:
  - `worker_id`
  - `unit` (viên, m3, ...)
  - `quantity`
  - `price_per_unit`
  - `total_salary`

---

## 4. Sales (Bán hàng - Gạch)

### 4.1 Product (Sản phẩm bán)

- `name` (gạch)
- `unit`: viên

---

### 4.2 Sales Order

- `customer_name`
- `total_quantity` (ví dụ: 1000 viên)
- `price_per_unit`
- `total_amount`
- `date`
- `allow_debt`: true/false

---

## 5. Debt Management (Công nợ)

### 5.1 Payment Tracking

Cho phép khách trả nhiều lần

#### Cấu trúc:

- `order_id`
- `paid_amount`
- `payment_date`

---

### 5.2 Debt Calculation

- `total_amount`
- `total_paid`
- `remaining_debt`

---

## 6. Key Features

### 6.1 Flexible Unit System

- Cho phép cấu hình:
  - xe, bồn, lượt
  - quy đổi sang đơn vị chuẩn

---

### 6.2 Dynamic Pricing

- Giá có thể thay đổi theo từng lần nhập/bán

---

### 6.3 Debt Tracking

- Theo dõi:
  - đã trả bao nhiêu
  - còn nợ bao nhiêu
  - lịch sử thanh toán

---

### 6.4 Worker Payment System

- Hỗ trợ:
  - công nhật
  - công theo sản phẩm

---

## 7. Suggested Data Model (Simplified)

### Tables:

- `items`
- `unit_conversions`
- `import_transactions`
- `workers`
- `worker_attendance`
- `worker_piece_logs`
- `products`
- `sales_orders`
- `payments`

---

## 8. Notes

- Tất cả giá trị tiền tệ nên dùng kiểu số lớn (BigDecimal)
- Nên lưu lịch sử thay đổi giá
- Hỗ trợ chỉnh sửa dữ liệu nhưng cần audit log nếu cần

---

## 9. Future Enhancements

- Báo cáo lợi nhuận
- Quản lý tồn kho
- Dashboard thống kê
- Export Excel

---

**End of Document**
