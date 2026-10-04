# Video Admin Manager

Bộ tài liệu đặc tả cho website admin quản lý video.

## Stack bắt buộc

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Supabase (Database, Auth, Storage)
- Không dùng React, Vue, Angular hoặc framework frontend khác.

## UI direction

- Light mode
- Nền trắng
- Giao diện admin hiện đại, sạch, dễ đọc
- Responsive cho desktop/tablet/mobile
- Ưu tiên component CSS tái sử dụng
- Biểu đồ dùng thư viện CDN nếu cần (ví dụ Chart.js), nhưng application logic vẫn là Vanilla JS.

## Trang chính

1. Dashboard
2. Video List
3. Video Create/Edit
4. Login
5. Register
6. Forgot Password / Reset Password
7. Account / Profile
8. Users Management (ADMIN)
9. Categories Management (ADMIN)

## Tài liệu đi kèm

- `01_PROJECT_SPEC.md`: yêu cầu tổng thể
- `02_UI_PAGE_SPEC.md`: đặc tả từng màn hình
- `03_SUPABASE_DATABASE.md`: schema, relationship, SQL
- `04_AUTH_AND_RLS.md`: Auth, role, RLS
- `05_STORAGE_AND_VIDEO_FLOW.md`: Supabase Storage và upload video
- `06_API_AND_DATA_ACCESS.md`: quy ước JavaScript data layer
- `07_SEED_DATA.md`: dữ liệu mẫu
- `08_VIBE_CODING_PROMPT.md`: prompt tổng để đưa vào AI coding assistant
- `09_ACCEPTANCE_CHECKLIST.md`: checklist nghiệm thu
