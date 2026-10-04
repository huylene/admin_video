# Project Specification — Video Admin Manager

## 1. Mục tiêu

Xây dựng một website admin quản lý video bằng HTML, CSS và Vanilla JavaScript, kết nối Supabase để:

- Đăng nhập/đăng ký/quên mật khẩu.
- Quản lý video.
- Quản lý người dùng theo role.
- Quản lý category/tag metadata cho video.
- Theo dõi views, storage usage và thống kê.
- Có Dashboard trực quan.

## 2. Vai trò

### ADMIN

Có quyền:

- Xem Dashboard.
- Xem/tạo/sửa/xóa video.
- Upload thumbnail/video.
- Quản lý users.
- Quản lý categories.
- Xem thống kê.

### USER

Có quyền:

- Đăng nhập.
- Xem Dashboard ở mức dữ liệu được cho phép nếu product yêu cầu.
- Xem danh sách video.
- Không được quản lý users/categories nếu không có quyền ADMIN.

> Backend authorization phải được enforce bằng Supabase RLS/policies. Không được chỉ ẩn menu bằng JavaScript.

## 3. Dashboard

Hiển thị các KPI card:

- Tổng số video.
- Tổng lượt xem.
- Dung lượng storage.

Biểu đồ:

- Bar chart: Top 10 video có nhiều lượt xem nhất.
- Line chart: lượt xem theo ngày/tháng.

Dashboard phải có trạng thái:

- Loading.
- Empty.
- Error.

## 4. Video List

Bảng gồm:

- ID
- Title
- Thumbnail
- Views
- Category
- Created At
- Status
- Action: Edit, Delete

Tính năng nên có:

- Search title.
- Filter category.
- Sort views/date.
- Pagination.
- Confirm modal trước khi delete.

## 5. Video Create/Edit

Fields đề xuất:

- Title — required.
- Description — optional.
- Thumbnail — image upload.
- Video file — required khi tạo mới.
- Category — required.
- Duration — có thể lấy từ metadata video.
- Status — `draft`, `published`, `archived`.
- Published At — nullable.

Khi edit:

- Có thể giữ file cũ nếu không upload file mới.
- Nếu thay video file, phải cập nhật metadata/storage path an toàn.

## 6. Auth

Trang:

- `/login.html`
- `/register.html`
- `/forgot-password.html`
- `/reset-password.html`

Flow:

1. User submit email/password.
2. Supabase Auth xử lý authentication.
3. Sau khi login, đọc profile/role từ database.
4. Redirect vào dashboard.
5. Nếu session hết hạn, đưa user về login.
6. Forgot password sử dụng Supabase password recovery.

> Không nên tạo authentication bằng cách so sánh password plaintext trong JavaScript.

## 7. Account

Thông tin:

- Avatar.
- Username.
- Email.
- Role (read-only với user thường).
- Created At.

Cho phép:

- Update username/profile.
- Update avatar nếu cần.
- Đổi password bằng Supabase Auth.

## 8. Non-functional requirements

- Mobile responsive.
- Accessibility cơ bản: label, keyboard navigation, focus state.
- Không hard-code Supabase query vào UI component nếu có thể tách data layer.
- Không expose service role key ở frontend.
- Chỉ dùng Supabase anon/publishable key trong frontend.
- Hiển thị toast cho thành công/lỗi.
