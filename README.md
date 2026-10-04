# Video Admin Manager

Website quản trị video hiện đại, tinh gọn và hiệu năng cao được xây dựng hoàn toàn bằng **HTML5, CSS3 và Vanilla JavaScript (ES6+)**, kết nối trực tiếp với **Supabase** (Database, Auth, Storage).

---

## 🌟 Tính năng nổi bật

1. **Bảo mật & Xác thực (Supabase Auth & RLS):**
   - Đăng nhập, Đăng ký (mặc định phân quyền `USER`), Quên mật khẩu, Đặt lại mật khẩu.
   - Quản lý phiên làm việc tự động với Token Refresh.
   - Phân quyền 2 lớp: Route Guards ở giao diện và Row Level Security (RLS) ở cấp PostgreSQL Database.

2. **Bảng điều khiển trực quan (Dashboard Analytics):**
   - KPI Cards: Tổng số video, Tổng lượt xem tích lũy, Tổng dung lượng lưu trữ (tự động quy đổi KB/MB/GB).
   - Biểu đồ Top 10 Video xem nhiều nhất (Chart.js Bar Chart).
   - Biểu đồ Xu hướng lượt xem (Chart.js Line Chart với bộ chuyển đổi Ngày / Tháng).
   - Danh sách video tải lên gần đây.

3. **Quản lý Video toàn diện (Videos Management):**
   - Bảng hiển thị: Preview Thumbnail, Tiêu đề, Danh mục, Lượt xem, Trạng thái (`draft`, `published`, `archived`), Ngày tạo.
   - Tìm kiếm thời gian thực theo tiêu đề, lọc theo danh mục, lọc theo trạng thái, sắp xếp và phân trang.
   - Modal xác nhận xóa video kèm dọn dẹp file vật lý trên Supabase Storage.

4. **Tạo mới & Chỉnh sửa Video (Video Create/Edit):**
   - Kéo thả file video (hỗ trợ MP4, WebM, MOV lên tới 200MB) và hình ảnh Thumbnail.
   - Thanh tiến trình tải lên (Upload Progress Bar).
   - Trình phát xem trước video (HTML5 Video Player preview) và tự động tính toán thời lượng (`duration_seconds`).
   - Tự động tạo slug thân thiện chuẩn SEO từ tiêu đề.
   - Ghi nhận chi tiết dung lượng file vào bảng `storage_assets` phục vụ KPI Storage.

5. **Quản lý Danh mục (Categories - Dành cho ADMIN):**
   - Danh sách danh mục kèm số lượng video liên kết.
   - Thêm mới, chỉnh sửa thông tin danh mục.
   - Cơ chế bảo vệ xóa an toàn: Chặn xóa nếu danh mục đang có video liên kết.

6. **Quản lý Người dùng (Users - Dành cho ADMIN):**
   - Tìm kiếm người dùng theo username hoặc email.
   - Lọc theo vai trò (`ADMIN` / `USER`).
   - Cập nhật phân quyền người dùng an toàn.

7. **Hồ sơ Cá nhân (Account Profile):**
   - Đổi ảnh đại diện (tải lên bucket `avatars`).
   - Cập nhật tên người dùng.
   - Đổi mật khẩu tài khoản trực tiếp qua Supabase Auth.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Khởi tạo Database & Storage trên Supabase

1. Mở [Supabase Dashboard](https://supabase.com/dashboard).
2. Vào mục **SQL Editor**, mở tệp [supabase_schema.sql](file:///Users/macbookprom1/Documents/admin_video/supabase_schema.sql) và nhấn **Run**.
3. Script sẽ tự động:
   - Tạo các bảng: `profiles`, `video_categories`, `videos`, `video_views`, `video_tags`, `video_tag_map`, `storage_assets`.
   - Tạo hàm `is_admin()` và trigger `on_auth_user_created` tự động tạo profile khi đăng ký.
   - Kích hoạt RLS và thiết lập toàn bộ Security Policies.
   - Khởi tạo 3 Storage Buckets công khai: `videos`, `thumbnails`, `avatars` và phân quyền Storage.
   - Nạp dữ liệu danh mục mẫu (`Entertainment`, `Education`, `Gaming`, `Music`) và Tags.

### Bước 2: Tạo tài khoản Quản trị viên (ADMIN) & Người dùng (USER)

1. Trong Supabase Dashboard, vào **Authentication > Users** và chọn **Add user**:
   - `admin1@gmail.com` / Mật khẩu: `123456`
   - `user1@gmail.com` / Mật khẩu: `123456`
2. Quay lại mục **SQL Editor**, chạy lệnh sau để cấp quyền `ADMIN` cho `admin1`:
   ```sql
   UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin1@gmail.com';
   ```

### Bước 3: Cấu hình kết nối Supabase vào Ứng dụng

Bạn có 2 cách cực kỳ đơn giản để cấu hình:

- **Cách 1 (Khuyên dùng):** Mở giao diện website trên trình duyệt, nhấn nút **"Cấu hình Supabase"** trên thanh Topbar hoặc banner cảnh báo, sau đó nhập:
  - **Supabase Project URL** (Ví dụ: `https://xyzcompany.supabase.co`)
  - **Supabase Anon / Public Key** (Khóa `anon` bắt đầu bằng `ey...`)
- **Cách 2:** Mở tệp [assets/js/config.js](file:///Users/macbookprom1/Documents/admin_video/assets/js/config.js) và dán URL cùng Anon Key vào biến `defaultUrl` và `defaultAnonKey`.

### Bước 4: Chạy ứng dụng

Vì ứng dụng sử dụng các module Vanilla JS và tải file, bạn nên chạy trên một local HTTP server (không mở trực tiếp `file://`):

```bash
# Sử dụng Python 3 có sẵn trên máy:
python3 -m http.server 3000

# Hoặc sử dụng npx serve:
npx serve .
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 📁 Cấu trúc Thư mục

```text
admin_video/
├── index.html                  # Trang điều hướng ban đầu
├── login.html                  # Đăng nhập
├── register.html               # Đăng ký (mặc định USER)
├── forgot-password.html        # Yêu cầu khôi phục mật khẩu
├── reset-password.html         # Đặt lại mật khẩu mới
├── dashboard.html              # Bảng điều khiển KPI & Biểu đồ Chart.js
├── videos.html                 # Danh sách video (Search, Filter, Pagination)
├── video-edit.html             # Tạo mới & Chỉnh sửa video (Upload Storage)
├── categories.html             # Quản lý danh mục (ADMIN only)
├── users.html                  # Quản lý người dùng (ADMIN only)
├── account.html                # Hồ sơ cá nhân & Đổi mật khẩu
├── supabase_schema.sql         # Script SQL toàn diện khởi tạo Supabase
├── supabase.txt                # Nơi lưu thông tin Supabase của bạn
├── assets/
│   ├── css/
│   │   ├── variables.css       # Design tokens (Màu sắc, Typography, Shadows)
│   │   ├── reset.css           # CSS Reset chuẩn
│   │   ├── layout.css          # Khung sườn Sidebar, Topbar & Mobile Drawer
│   │   ├── components.css      # Buttons, Cards, Tables, Modals, Toasts
│   │   └── pages.css           # Giao diện chi tiết từng trang
│   └── js/
│       ├── config.js           # Quản lý cấu hình kết nối Supabase
│       ├── supabase.js         # Khởi tạo Supabase Client v2
│       ├── auth.js             # Xử lý Supabase Auth & Profile
│       ├── guards.js           # Route Guards phân quyền ADMIN/USER
│       ├── upload.js           # Tải lên Storage & tính dung lượng file
│       ├── api.js              # Tầng Data Access (Videos, Categories, Analytics)
│       ├── ui.js               # Toast, Confirm Modal, Formatter & Layout chung
│       ├── dashboard.js        # Logic vẽ biểu đồ và KPI
│       ├── videos.js           # Logic bảng video & xóa an toàn
│       ├── video-edit.js       # Logic thêm/sửa video và thanh tiến trình
│       ├── categories.js       # Logic CRUD danh mục cho ADMIN
│       ├── users.js            # Logic quản lý người dùng cho ADMIN
│       └── account.js          # Logic cập nhật tài khoản & mật khẩu
└── video-admin-md/             # Tài liệu đặc tả kỹ thuật gốc
```
