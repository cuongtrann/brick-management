# Brik Management System (Hệ thống quản lý vật liệu xây dựng)

Hệ thống quản lý nội bộ dành cho các đại lý kinh doanh vật liệu xây dựng (gạch, đá, xi măng...). Hỗ trợ quản lý nhập-xuất hàng hóa, theo dõi dòng tiền, công nợ khách hàng, tính toán điểm danh & lương thợ một cách trực quan trên giao diện ứng dụng web.

## 🛠 Công nghệ sử dụng
- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS (v4) & Shadcn UI
- **Containerization:** Docker & Docker Compose

---

## 🚀 Hướng dẫn cài đặt môi trường Development (Code & Dev)

Dự án này sử dụng Docker để cô lập môi trường Database (PostgreSQL) nhằm giúp lập trình viên không phải cài đặt database rườm rà lên máy cá nhân.

### 1. Yêu cầu hệ thống (Prerequisites)
Bạn cần đảm bảo máy tính đã cài đặt các phần mềm sau:
- **Node.js** (Phiên bản >= 18.x)
- **Docker & Docker Compose** (Có thể dùng Docker Desktop hoặc Orbstack)
- **Git**

### 2. Tải mã nguồn & Cài đặt thư viện
```bash
# Clone project từ kho lưu trữ
git clone git@github.com:cuongtrann/brick-management.git
cd brick-management

# Cài đặt các gói phụ thuộc (Dependencies)
npm install
```

### 3. Khởi động Database với Docker
Chỉ cần khởi động container `db` (Postgres) trong file `docker-compose.yml` ở chế độ ngầm để lấy chỗ lưu trữ dữ liệu cục bộ:
```bash
docker-compose up -d db
```
> **Lưu ý:** PostgreSQL ở môi trường local sẽ chạy ở cổng `5434` (để tránh xung đột với các db postgres khác nếu có trên máy).

### 4. Thiết lập biến môi trường (.env)
Sao chép file mẫu `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mặc định chuỗi kết nối Database `DATABASE_URL` trong file `.env` đã được cấu hình sẵn để kết nối tới cổng `5434` trùng khớp với thiết lập của Docker Compose.

### 5. Khởi tạo & Cập nhật Cấu trúc Database (Migrations)
Sử dụng Prisma để truyền dữ liệu và đồng bộ hóa lược đồ (schema) vào database:
```bash
# Tạo các type tĩnh cho Typescript trước khi chạy
npx prisma generate

# Đồng bộ lược đồ (Bảng, Cột) vào Database cục bộ
npx prisma migrate dev
```
> Nếu cửa sổ dòng lệnh hỏi thông tin bổ sung, bạn có thể nhập tên cho bản migrate (vd: `init`).

### 6. Chạy Máy chủ Phát triển (Dev Server)
Bật ứng dụng:
```bash
npm run dev
```
Truy cập vào [http://localhost:3000](http://localhost:3000) trên trình duyệt để thưởng thức thành quả! 🎉

---

## 📦 Hướng dẫn Xây dựng Môi trường Production (Triển khai thật)

Nếu bạn muốn đóng gói và triển khai ứng dụng này lên 1 máy chủ (VPS/Server) thực tế, mọi thứ đã được cấu hình sẵn chuẩn Docker:

1. Copy mã nguồn (hoặc kéo từ git) về máy chủ.
2. Trên máy chủ, chỉnh lại file `.env` bằng các thông số thực.
3. Chạy lệnh đóng gói và khởi chạy tất cả dịch vụ (Web Server + Database):
```bash
docker-compose up --build -d
```
Ứng dụng sẽ hoàn toàn tự động thực hiện migration (thông qua file `docker-entrypoint.sh`) và chạy Next.js ở chế độ tối ưu Production. Cổng mặc định mở ra bên ngoài là `3000`.

---
## 🧭 Cấu trúc Project chính
- `app/`: Thư mục khai báo cấu trúc định tuyến (App Router) của Next.js và bao phủ tất cả API Route.
- `components/ui/`: Thư viện Component giao diện được tái sử dụng qua cấu trúc của Shadcn UI.
- `prisma/schema.prisma`: Nơi duy nhất khai báo cấu trúc Database và các mối quan hệ (Relational DB). Vui lòng cập nhật thông tin tại đây trước khi phát triển các module sâu hơn.
