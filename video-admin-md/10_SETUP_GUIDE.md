# Supabase Setup Guide

## 1. Create project

Tạo project mới trong Supabase.

## 2. Run SQL

Chạy SQL trong `03_SUPABASE_DATABASE.md` và `04_AUTH_AND_RLS.md` theo thứ tự:

1. Tables/extensions/indexes.
2. Trigger for profiles.
3. `is_admin()` function.
4. RLS enable.
5. Policies.
6. Seed categories/tags.

## 3. Create Storage buckets

Tạo:

- `videos`
- `thumbnails`

Sau đó thêm Storage policies phù hợp với model quyền của project.

## 4. Configure frontend

Điền:

```js
window.APP_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_OR_PUBLISHABLE_KEY'
};
```

Không đưa service-role secret vào repository/frontend.

## 5. Create demo users

Trong Supabase Auth, tạo:

- admin1@gmail.com
- user1@gmail.com

Sau đó set profile role theo `07_SEED_DATA.md`.

## 6. Local development

Có thể chạy static site bằng VS Code Live Server hoặc một static HTTP server.

Không nên mở trực tiếp bằng `file://` nếu application cần module imports hoặc callback URL.

## 7. Redirect URLs

Trong Supabase Auth settings, cấu hình Site URL và Redirect URLs cho local/deployed domain, bao gồm trang reset password.
